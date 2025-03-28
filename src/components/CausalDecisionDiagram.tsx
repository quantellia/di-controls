import React, { useState, useMemo, useEffect } from "react";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import DiagramElement from "./DiagramElement";
import { evaluateModel } from "../lib/evaluateModel"

type CausalDecisionDiagramProps = {
    model: any;
}

const CausalDecisionDiagram: React.FC<CausalDecisionDiagramProps> = ({
    model,
}) => {

    const updateXarrow = useXarrow();

    //Evaluatable Assets: Import functions from their Base64-encoded string values
    const functionMap = useMemo(() => { //"<ScriptUUID>_<FunctionName>": function
        const funcMap = new Map();
        model.evaluatableAssets?.forEach((evalAsset: any) => {
            if(evalAsset.evalType == "Script" && evalAsset.content.language == "javascript")
            {
                const scriptString = atob(evalAsset.content.script);
                //scriptCode returns a function map with function names as keys and function code as values
                const scriptCode = eval(scriptString);
        
                const thisScriptFunctionMap = scriptCode.funcMap;
                Object.keys(thisScriptFunctionMap).forEach((funcName) => {
                    funcMap.set(`${evalAsset.meta.uuid}_${funcName}`, thisScriptFunctionMap[funcName])
                })
            }
        });
        return funcMap;
    }, [model]);

    //Construct a read-only lookup map for I/O values
    //This creates a firewall between the simulation state of
    //I/O values and the I/O values stored in JSON.
    //Only reset the initial simulation state of the I/O values
    //if the user has explicitly edited these in the JSON.
    const initialIOValues = useMemo(() => {
        const values = new Map();
        model.inputOutputValues?.forEach((ioVal: any) => {
            values.set(ioVal.meta.uuid, ioVal.data);
        });
        return values;
    }, [model.inputOutputValues]);

    //Store mutable copy of initial I/O values here. When these are updated,
    //evaluate the model and store the computed I/O values in computedIOValues
    const [IOValues, setIOValues] = useState(initialIOValues);

    //Reset IOValues when user has edited initial IO Values
    useEffect(() => {
        setIOValues(initialIOValues);
    }, [initialIOValues]);

    //Holds the results of evaluation runs.
    //Whenever I/O values or the underlying model (etc) change, re-evaluate the model.
    //Displays will prefer to use THIS I/O map when setting their current values.
    const computedIOValues = useMemo(() => {
        return evaluateModel(model, functionMap, IOValues);
    }, [model, functionMap, IOValues]);

    //Maps diagram element UUIDs to their list of associated I/O values. Associated via their control.
    const controlsMap = useMemo(() => {
        const controls = new Map<string, Array<string>>();
        model.controls?.forEach((control: any) => {
            control.displays.forEach((displayUUID: any) => {
                if(!controls.has(displayUUID)) {
                    controls.set(displayUUID, control.inputOutputValues);
                }
                else
                {
                    console.error(
                        `Error: Multiple Control elements found for Diagram Element ${displayUUID}.`,
                        `Engine will only use the first control processed for this element. Ignoring control: `,
                        control,
                        ` - This element has these associated I/O values: `,
                        controls.get(displayUUID)
                    )
                }
            });
        });
        return controls;
    }, [model]);

    //Generate HTML for dependency arrows
    const dependencyArrows = model.diagrams[0].dependencies.map((dep: any) => (
        <Xarrow
        key={dep.meta.uuid}
        start={dep.source}
        end={dep.target}
        strokeWidth={2}
        curveness={0.4}
        />
    ))

    //Generate HTML for diagram elements
    //Diagram elements wrap inner content in a consistent draggable outer shell
    const diagramElements = model.diagrams[0].elements.map((elem: any) => {
        return <DiagramElement
        elementData={elem}
        computedIOValues={computedIOValues}
        IOValues={IOValues}
        setIOValues={setIOValues}
        controlsMap={controlsMap}
        updateXarrow={updateXarrow}
        />
    })

    return (
        /*Wrapper for Xarrows*/
        <Xwrapper>
        <div style={{ fontFamily: "sans-serif"}}>
            {/* Draw arrows BELOW element boxes */}
            {dependencyArrows}
            {diagramElements}
        </div>
        </Xwrapper>
    );

}

export default CausalDecisionDiagram;