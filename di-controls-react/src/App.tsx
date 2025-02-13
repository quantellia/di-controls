import { useCallback, useEffect, useRef, useState } from "react";
import graphData from "./schema_compliant_cdd.json" assert {type: "json"};
import { Gauge, StackedBarplot } from "./components/DataVisualizations";
import { CheckBoxGroup, Slider } from "./components/BasicControls";
import * as d3 from "d3";
import Draggable from "react-draggable";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { Dial } from "./components/Controls";

function App() {
  
  const updateXarrow = useXarrow();
  

  return (
    <Xwrapper>
      <div style={{ fontFamily: "sans-serif" }}>
        <div>
        {graphData.diagrams[0].elements.map((elem) => {
            return (
              <Draggable
                defaultPosition={elem.content.position}
                onDrag={updateXarrow}
                onStop={() => {
                  updateXarrow();
                }}
                key={"draggable-" + elem.meta.uuid}
              >
                <div>
                  <legend>{elem.meta.name}</legend>
                </div>
              </Draggable>
            )
          })}
        </div>
      </div>
    </Xwrapper>
  );
}

export default App;
