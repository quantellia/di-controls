import { useCallback, useEffect, useRef, useState } from "react";
import graphData from "./schema_compliant_cdd.json" assert {type: "json"};
import Draggable from "react-draggable";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";

function App() {
  
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
          {elem.meta.name}
          <hr style={{border: "1px solid black", marginInline: "-5px"}}/>
          {elem.causalType}
        </div>
      </Draggable>
    )
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
