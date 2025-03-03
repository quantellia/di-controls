import { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import graphData from "./schema_compliant_cdd.json" assert {type: "json"};
import Draggable from "react-draggable";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import Slider from "./components/Slider";


// function CodeForAdd() {
//   (function () {
//     const add = function (vals) {
//       let sum = 0;
//       vals.forEach((val) => {
//         sum += val;
//       });
//       return [sum];
//     };
  
//     return { funcMap: { "add": add } };
//   })();
// }

function App() {
  //Evaluatable Assets: Import modules from their Base64-encoded string values
  let functionMap = new Map(); //"<ScriptUUID>_<FunctionName>": function
  graphData.evaluatableAssets.forEach((evalAsset) => {
    if(evalAsset.evalType == "Script" && evalAsset.content.language == "javascript")
    {
      const scriptString = atob(evalAsset.content.script);
      // console.log("Script: ", scriptString);
      const scriptCode = eval(scriptString);

      const thisScriptFunctionMap = scriptCode.funcMap;
      Object.keys(thisScriptFunctionMap).forEach((funcName) => {
        functionMap.set(evalAsset.meta.uuid + "_" + funcName, thisScriptFunctionMap[funcName])
      })
    }
  })

  let IOValues = new Map();
  graphData.inputOutputValues.forEach((ioVal) => {
    IOValues.set(ioVal.meta.uuid, ioVal.data);
  })

  // console.log("function map", functionMap);

  const evaluateModel = function (funcMap = functionMap, ioMap = IOValues, data = graphData, evalModelNumber = 0) {
    let evals = new Map();
    data.evaluatables[evalModelNumber].elements.forEach((elem) => {
      evals.set(elem.meta.uuid, elem);
    })

    // console.log("Evaluatables", evals);
    
    //Execute entry points
    data.evaluatables[evalModelNumber].entryPoints.forEach((uuid) => {
      const evalElem = evals.get(uuid);
      const evalInputs = evalElem.inputs.map((uuid: String) => {
        return ioMap.get(uuid);
      })
      const evalFunction = funcMap.get("" + evalElem.evaluatableAsset + "_" + evalElem.functionName) ?? (() => {return []})
      // console.log("" + evalElem.evaluatableAsset + "_" + evalElem.functionName);
      // console.log("Eval Function: ", evalFunction);
      const evaluatedOutputs = evalFunction(evalInputs)

      for(let i = 0; i < evalElem.outputs.length && i < evaluatedOutputs.length; i++) {
        ioMap.set(evalElem.outputs[i], evaluatedOutputs[i]);
      }
    })
  }
  evaluateModel();
  // console.log("IO Values", IOValues);

  //Maps diagram element UUIDs to their list of associated I/O values. Associated via their control.
  //One issue here is the case where multiple separate controls are associated with the same diagram element.
  //This map's values should later take the form of a unique set, where the inner foreach loop adds to that set if it already exists.
  let controlsMap = new Map(); //"<DiaElemUUID>": ["<IOValueUUID>", ... "<IOValueUUID>"]
  graphData.controls.forEach((control) => {
    control.diagramElements.forEach((controlledDiagramElementUUID) => {
      controlsMap.set(controlledDiagramElementUUID, control.inputOutputValues);
    })
  })

  //I/O Values
  let inputOutputValues = new Map(); //"<IOValueUUID>": <value>
  graphData.inputOutputValues.forEach((ioVal) => {
    inputOutputValues.set(ioVal.meta.uuid, ioVal.data);
  })
  
  const updateXarrow = useXarrow();
  
  //Generate HTML for dependency arrows
  const dependencyArrows = graphData.diagrams[0].dependencies.map((dep) => (
    <Xarrow
      key={dep.meta.uuid}
      start={dep.source}
      end={dep.target}
      strokeWidth={2}
      curveness={0.4}
    />
  ))

  //Generate HTML for diagram elements
  const diagramElements = graphData.diagrams[0].elements.map((elem) => {
    if(elem.diaType == "box")
    {
      return (
        <Draggable
          defaultPosition={elem.content.position}
          onDrag={updateXarrow}
          onStop={updateXarrow}
          key={"draggable-" + elem.meta.uuid}
        >
          <div 
            id={elem.meta.uuid}
            style={{
              border: "2px solid #000000",
              backgroundColor: "#4f5af8",
              width: "200px",
              color: "#ffffff",
              padding: "5px",
              position: "absolute"
            }}
          >
            {elem.meta.name ?? "Untitled Element"}
            <hr style={{border: "1px solid black", marginInline: "-5px"}}/>
            {elem.causalType}
          </div>
        </Draggable>
      )
    }
    if(elem.diaType == "controlRange")
    {

      const elemIOValuesList = controlsMap.get(elem.meta.uuid) ?? [null];

      return (
        <Draggable
          defaultPosition={elem.content.position}
          onDrag={updateXarrow}
          onStop={updateXarrow}
          key={"draggable-" + elem.meta.uuid}
        >
          <div
            id={elem.meta.uuid}
            style={{
              border: "2px solid #000000",
              backgroundColor: "#4f5af8",
              width: "300px",
              color: "#ffffff",
              padding: "5px",
              position: "absolute"
            }}
          >
            <Slider
              title={elem.causalType + ": " + (elem.meta.name ?? "Unnamed slider")}
              min={elem.content.controlParameters?.min ?? 0}
              max={elem.content.controlParameters?.max ?? 10}
              step={elem.content.controlParameters?.step ?? 1}
              currentValue={IOValues.get(elemIOValuesList[0]) ?? -1}
              setCurrentValue={(elem.content.controlParameters?.isInteractive ?? false) ? function (value: SetStateAction<number>): void {
                // IOValues.set(elemIOValuesList[0], value);
                // evaluateModel();
                //TODO: MAKE THIS ACTUALLY UPDATE VALUES AND RE-EVALUATE THE MODEL!!!
              } : () => {} }              
            ></Slider>
          </div>
        </Draggable>
      )
    }
  })

  return (
    <Xwrapper>
      <div style={{ fontFamily: "sans-serif"}}>
        {/* Draw arrows BELOW element boxes */}
        {dependencyArrows}
        {diagramElements}
      </div>
    </Xwrapper>
  );
}

export default App;
