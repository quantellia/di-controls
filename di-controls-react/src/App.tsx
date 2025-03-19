import { useCallback, useState, useMemo } from "react";
import graphData from "./model_json/strings_bools_multidisplays.json" assert {type: "json"};
import Draggable from "react-draggable";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import Slider from "./components/Slider";

// Note: This code is included in graphData, as a base64 encoded string.
// 
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

// function test() {
//   (function () {
//       //Expects a boolean first, then an arbitrary-length list of strings
//       //to combine. Boolean determines order.
//       const combineStrings = function (vals) {
//           console.log(vals);
//           const reverseOrder = vals[0];
//           vals = reverseOrder ? vals.slice(1).reverse() : vals.slice(1);
//           console.log(vals);

//           let outString = ""
//           vals.forEach((val) => {
//           outString += val;
//           });
//           return [outString];
//       };
    
//       return { funcMap: { "combineStrings": combineStrings } };
//   })();
// }

// 
//    ====IMPORTANT README====
// 
// To import another script, it must use a similar structure to the adder code above. It should take the form of
// an immediately invoked function expression: https://developer.mozilla.org/en-US/docs/Glossary/IIFE where the
// function returns a function map called funcMap.
// 
// funcMap should have string keys and function values. String keys will be used by Evaluatable Elements
// to pass inputs to and receive outputs from the functions.
// 
// Example:
// 
// 
// (function () {
//   const myScriptFunction = function (inputs) {
//     console.log(inputs);
//     return [null];
//   };
// 
//   return { funcMap: {"myScriptFunction": myScriptFunction} };
// })();
// 
// Note: inputs must be an array of values. Here the input array is printed to console.
// Note: defined functions must return outputs as an array of values. Here the output is an array with a single null value.
// 

function App() {

  //Evaluatable Assets: Import functions from their Base64-encoded string values
  let functionMap = new Map(); //"<ScriptUUID>_<FunctionName>": function
  graphData.evaluatableAssets.forEach((evalAsset) => {
    if(evalAsset.evalType == "Script" && evalAsset.content.language == "javascript")
    {
      const scriptString = atob(evalAsset.content.script);
      //scriptCode returns a function map with function names as keys and function code as values
      const scriptCode = eval(scriptString);

      const thisScriptFunctionMap = scriptCode.funcMap;
      Object.keys(thisScriptFunctionMap).forEach((funcName) => {
        functionMap.set(`${evalAsset.meta.uuid}_${funcName}`, thisScriptFunctionMap[funcName])
      })
    }
  })

  //I/O Values
  const [IOValues, setIOValues] = useState(() => {
    //Generate initial map of IO Values, stored in IOValues.
    let initialIOValues = new Map();
    graphData.inputOutputValues.forEach((ioVal) => {
      initialIOValues.set(ioVal.meta.uuid, ioVal.data);
    });
    return initialIOValues;
  })

  // 
  //  ====MAIN MODEL EVALUATION FUNCTION====
  //
  const evaluateModel = useCallback((funcMap = functionMap, ioMap = IOValues, data = graphData, evalModelNumber = 0) => {
    console.log("Eval start.");


    // Model pre-processing
    
    let evals = new Map(); //Key: "Evaluatable Element UUID" -- Value: Evaluatable Element
    let unevaluated = new Array<string>(); //Lists UUIDs for Eval Elements that haven't been evaluated yet
    let outputValues = new Set<string>(); //Lists UUIDs for IO Vals that are referenced in Eval Elements as Outputs
    //Populate the above empties
    data.runnableModels[evalModelNumber].elements.forEach((elem) => {
      evals.set(elem.meta.uuid, elem);
      unevaluated.push(elem.meta.uuid); //All elements start as unevaluated

      elem.outputs.forEach((IOValUUID: string) => {
        //Since execution order is not guaranteed, an IO value used as an output for more than one
        //eval element has a non-deterministic value when used as an input elsewhere
        if(outputValues.has(IOValUUID))
        {
          console.error(`Error: Possible non-deterministic behavior from output ${IOValUUID} (Used as output multiple times. Execution order is not guaranteed.)`);
        }
        else
        {
          outputValues.add(IOValUUID)
        }
      });
    });

    //The set of I/O Values that have known values for this evaluation run.
    //To start, assume that every I/O value that is never referenced as an Output has a known value.
    //These will be our initial inputs.
    let knownIOValues = new Set<string>(Array.from(ioMap.keys()).filter((IOValUUID: string) => !outputValues.has(IOValUUID)))

    //Make a copy of our I/O Map. This function will return the new map as output.
    //This is so we don't mutate the original I/O Map and make React upset.
    let newIOValues = new Map(ioMap);

    //Evaluation will continue until we either run out of unevaluated elements
    //OR we fail to remove any elements from the unevaluated list in an iteration
    let evalInProgress = unevaluated.length > 0;
    let prevUnevalLength = -1;


    // Main Eval loop

    while(evalInProgress)
    {
      console.log("Step started. To eval: ", unevaluated);

      //Try to evaluate unevaluated elements. If successful, remove them from unevaluated list.
      let toRemoveFromUnevaluated = new Set<string>();
      unevaluated.forEach((uuid: string) => {
        const evalElem = evals.get(uuid);
        const evalInputs = evalElem.inputs.map((uuid: String) => newIOValues.get(uuid));

        //This element can be evaluated if we have a known value for all of its requested inputs
        const isReadyToEval = evalElem.inputs.every((inputUUID: string) => knownIOValues.has(inputUUID));
        if(isReadyToEval)
        {
          console.log("Evaluating ", uuid, " - Populated IO Values: ", knownIOValues);

          //Get the function from our function map and run it to get our new outputs
          const evalFunction = funcMap.get(`${evalElem.evaluatableAsset}_${evalElem.functionName}`) ?? (() => {return []})
          const evaluatedOutputs = evalFunction(evalInputs)
    
          //Function outputs are assumed to be given in the same order as they're listed in the eval element
          for(let i = 0; i < evalElem.outputs.length && i < evaluatedOutputs.length; i++) {
            newIOValues.set(evalElem.outputs[i], evaluatedOutputs[i]);
            knownIOValues.add(evalElem.outputs[i]);
          }

          //Right now there's no validation step to confirm that an element evaluated successfully.
          //It's just assumed successful after we load and run the function.
          toRemoveFromUnevaluated.add(uuid);
        }
      })

      unevaluated = unevaluated.filter((unevalUUID: string) => !toRemoveFromUnevaluated.has(unevalUUID)); //Remove the elements that we evaluated this iteration

      console.log("Step complete. Evaluated: ", toRemoveFromUnevaluated);

      //Determine whether we need another eval iteration
      evalInProgress = unevaluated.length > 0;
      if(unevaluated.length == prevUnevalLength) {
        console.error("List of unevaluated elements has not changed between evaluation iterations. Terminating evaluation.");
        evalInProgress = false;
      }
      prevUnevalLength = unevaluated.length;
    }
    console.log("Eval Complete! IO Values: ", newIOValues);

    return newIOValues;
    
  }, []);

  const computedIOValues = useMemo(() => {
    return evaluateModel(functionMap, IOValues, graphData);
  }, [IOValues, functionMap, graphData]);

  // console.log("IO Values", IOValues);

  //Maps diagram element UUIDs to their list of associated I/O values. Associated via their control.
  let controlsMap = new Map<string, Array<string>>(); //"<DiaElemUUID>": ["<IOValueUUID>", ... "<IOValueUUID>"]
  graphData.controls.forEach((control) => {
    control.displays.forEach((controlledDisplayUUID) => {
      if(controlsMap.get(controlledDisplayUUID) !== undefined)
      {
        console.error(
          `Error: Multiple Control elements found for Diagram Element ${controlledDisplayUUID}.`,
          `Engine will only use the first control processed for this element. Ignoring control: `,
          control,
          ` - This element has these associated I/O values: `,
          controlsMap.get(controlledDisplayUUID)
        )
      }
      else
      {
        controlsMap.set(controlledDisplayUUID, control.inputOutputValues);
      }
    })
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
  //Diagram elements wrap inner content in a consistent draggable outer shell
  const diagramElements = graphData.diagrams[0].elements.map((elem) => {

    let headerContent = null;
    if(elem.causalType !== null)
    {
      headerContent = <div>
        <div style={{wordWrap: "break-word", width: "300px"}}>
          <label>{elem.meta.name ?? "Untitled Element"}</label>
          <br></br>
          <label>{elem.causalType}</label>
        </div>
        <hr style={{border: "1px solid black", marginInline: "-5px"}}/>
      </div>
    }

    let displayContents = elem.displays?.map((elemDisplay) => {
      let thisDisplay = <div></div>
      if(elemDisplay.displayType == "controlRange")
      {
        const displayIOValuesList = controlsMap.get(elemDisplay.meta.uuid) ?? [null];
        thisDisplay = <div><Slider
          title={(elemDisplay.meta.name ?? "")}
          min={elemDisplay.content.controlParameters?.min ?? 0}
          max={elemDisplay.content.controlParameters?.max ?? 10}
          step={elemDisplay.content.controlParameters?.step ?? 1}
          currentValue={computedIOValues.get(displayIOValuesList[0]) ?? -1}
          setCurrentValue={(elemDisplay.content.controlParameters?.isInteractive ?? false)
            ? (value) => {
              setIOValues((prevIOValues) => {
                const newIOVals = new Map(prevIOValues);
                newIOVals.set(displayIOValuesList[0], value);
                return newIOVals;
              });
            }
            : () => {} }              
        ></Slider></div>
      }
      else if(elemDisplay.displayType == "controlText")
      {
        const displayIOValuesList = controlsMap.get(elemDisplay.meta.uuid) ?? [null];
        let textDisplay = <div></div>
        if(elemDisplay.content.controlParameters?.isInteractive ?? false)
        {
          textDisplay = <input
            type="text"
            value={computedIOValues.get(displayIOValuesList[0]) ?? elemDisplay.content.controlParameters?.value ?? ""}
            onChange={(event) => {
              setIOValues((prevIOValues) => {
                const newValue = event.target.value;
                const newIOVals = new Map(prevIOValues);
                newIOVals.set(displayIOValuesList[0], newValue);
                return newIOVals;
              })
            }}
          />
        }
        else
        {
          textDisplay = <div style={{wordWrap: "break-word", width: "300px"}}>
            <label>{computedIOValues.get(displayIOValuesList[0]) ?? elemDisplay.content.controlParameters?.value ?? ""}</label>
          </div>
        }

        const displayLabel = elemDisplay.meta.name ?
          <div>
            <br></br>
            {elemDisplay.meta.name}
          </div>
          : null;
        thisDisplay = <div>
            {displayLabel}
            {textDisplay}
          </div>
      }
      else if(elemDisplay.displayType == "controlBoolean")
      {
        const displayIOValuesList = controlsMap.get(elemDisplay.meta.uuid) ?? [null];
        
        const displayLabel = elemDisplay.meta.name ?
          <div>
            <br></br>
            {elemDisplay.meta.name}
          </div>
          : null;

        thisDisplay = 
        <div>
          {displayLabel}
          <input
            type="checkbox"
            checked={computedIOValues.get(displayIOValuesList[0]) ?? !!(elemDisplay.content.controlParameters?.value)}
            onChange={(event) => {
              setIOValues((prevIOValues) => {
                const newValue = event.target.checked;
                const newIOVals = new Map(prevIOValues);
                newIOVals.set(displayIOValuesList[0], newValue);
                return newIOVals;
              })
            }}
          />
        </div>
        
      }
      return thisDisplay;
    })

    //Construct inner content based on the diagram element's display contents
    let innerContent = <div>
      {headerContent ?? <div></div>}
      {displayContents}
    </div>
    
    //Construct draggable outer shell and put inner content inside
    return (
      <Draggable
        handle=".handle"
        defaultPosition={elem.position}
        onDrag={updateXarrow}
        onStop={updateXarrow}
        key={"draggable-" + elem.meta.uuid}
      >
        {/*Draggable supports only one child element. Wrap children one div.*/}
        {/*This div holds the element UUID for Xarrows mapping.*/}
        <div
          id={elem.meta.uuid}
          style= {{
            position: "absolute"
          }}
        >
          {/*Upper black handle for dragging the draggable element.*/}
          <div 
            className="handle"
            style={{
              backgroundColor: "#000000",
              color: "#cccccc",
              width: "313px",
              height: "15px",
              cursor: "grab"
            }}
          ></div>
          {/*Lower blue square for holding inner content.*/}
          <div
            style={{
              border: "2px solid #000000",
              backgroundColor: "#4f5af8",
              color: "#ffffff",
              padding: "5px",
              width: "300px"
            }}
          >
            {innerContent}
          </div>
        </div>
      </Draggable>
    )
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

export default App;
