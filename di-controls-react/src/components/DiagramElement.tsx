import React from "react";
import DisplayRenderer from "./DisplayRenderer";
import DisplaysSection from "./DisplaysSection";
import Draggable from "react-draggable";

type DiagramElementProps = {
    elementData: any;
    computedIOValues: Map<string, any>;
    IOValues: Map<string, any>;
    setIOValues: React.Dispatch<React.SetStateAction<Map<string, any>>>;
    controlsMap: Map<string, string[]>;
    updateXarrow: () => void;
  };

/**
 * Renders an element of a Causal Decision Diagram.
 * These are draggable boxes with a few sections.
 * Top section displays the element name and Causal Type.
 * Below this are up to two sections of Displays (see DisplaySection.tsx)
 * First, non-interactive Displays are listed together.
 * Next, interactive Displays are listed together (sometimes collapsed by default).
 */
const DiagramElement: React.FC<DiagramElementProps> = ({
    elementData,
    computedIOValues,
    IOValues,
    setIOValues,
    controlsMap,
    updateXarrow,
  }) => {

    // Header shows basic element info like Name and Causal Type.
    // Header is considered optional. If no causal type is provided, assume
    // this element is just a Display holder (for annotations and the like).
    let headerContent = <div></div>;
    if(elementData.causalType !== null)
    {
      headerContent = <div>
        <div style={{wordWrap: "break-word", width: "95%"}}>
          <label>{elementData.meta.name ?? "Untitled Element"}</label>
          <div style={{height:"5px"}}></div>
          <label style={{fontSize:"12px"}}>{elementData.causalType}</label>
        </div>
      </div>
    }

    // Construct Display sections
    let nonInteractiveDisplays = new Array<JSX.Element>();
    let displayContents = new Array<JSX.Element>();
    elementData.displays?.forEach((elemDisplay: any) => {
      const displayJSX = <DisplayRenderer
        display={elemDisplay}
        computedIOValues={computedIOValues}
        IOValues={IOValues}
        setIOValues={setIOValues}
        controlsMap={controlsMap}
      />

      if(elemDisplay.content.controlParameters?.isInteractive)
      {
        displayContents.push(displayJSX);
      }
      else
      {
        nonInteractiveDisplays.push(displayJSX);
      }
    });

    //Compose inner content from the two above components.
    //Inner content holds the header content and Display sections in a blue box
    let innerContent = (
      <div
        style={{
          border: "2px solid #000000",
          backgroundColor: "#4f5af8",
          color: "#ffffff",
          padding: "0px",
          width: "300px"
        }}
      >
        <div style={{margin:"0px", padding:"0px"}}>
          <div style={{
            padding:"5px"
          }}>
            {headerContent}
          </div>
          <DisplaysSection displays={nonInteractiveDisplays} expandByDefault={true}/>
          <DisplaysSection displays={displayContents} expandByDefault={["Lever", "External"].includes(elementData.causalType) && displayContents.length < 3}/>
        </div>
      </div>
    );
    
    //Construct draggable outer shell and put inner content inside
    return (
      <Draggable
        handle=".handle"
        defaultPosition={elementData.position}
        onDrag={updateXarrow}
        onStop={updateXarrow}
        key={"draggable-" + elementData.meta.uuid}
      >
        {/*Draggable supports only one child element. Wrap children one div.*/}
        {/*This div holds the element UUID for Xarrows mapping.*/}
        <div
          id={elementData.meta.uuid}
          style= {{
            position: "absolute",
            margin:"0px",
            padding:"0px"
          }}
        >
          {/*Upper black handle for dragging the draggable element.*/}
          <div 
            className="handle"
            style={{
              backgroundColor: "#000000",
              color: "#cccccc",
              width: "300px",
              border: "2px solid #000000",
              height: "12px",
              cursor: "grab"
            }}
          ></div>
          {innerContent}
        </div>
      </Draggable>
    )
  };

  export default DiagramElement;