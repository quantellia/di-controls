import React from "react";
import Slider from "./Slider";

type DisplayRendererProps = {
    display: any;
    computedIOValues: Map<string, any>;
    IOValues: Map<string, any>;
    setIOValues: React.Dispatch<React.SetStateAction<Map<string, any>>>;
    controlsMap: Map<string, string[]>;
};

/**
 * Renders a Display component on a Diagram Element.
 * These can be sliders, textboxes, etc.
 * 
 * Displays expect to be connected to an IO value via a Control.
 */
const DisplayRenderer: React.FC<DisplayRendererProps> = ({
    display,
    computedIOValues,
    IOValues,
    setIOValues,
    controlsMap,
}) => {

    /*
     * Define some commonly-used constants
     */

    // Consult the Controls map to see if there are I/O values associated with this Display
    const displayIOValuesList = controlsMap.get(display.meta.uuid) ?? [null];
    
    // Sets a single value in the IO Values map.
    // Assumes the value UUID is at displayIOValuesList[0]
    // TODO: This could be more general-purpose. Arbitrary-length value list.
    const setSingleValue = (newValue: any) => {
        setIOValues((prevIOValues) => {
            const newIOVals = new Map(prevIOValues);
            newIOVals.set(displayIOValuesList[0] ?? display.meta.uuid, newValue);
            return newIOVals;
        })
    }

    // Some displays are constructed differently if they're non-interactive
    const isInteractive = display.content.controlParameters?.isInteractive ?? false;
    // Most displays label themselves with their name
    const label = display.meta.name ?? "";

    /*
     * This switch statement holds all the JSX definitions
     * for each supported type of Display
     */
    switch (display.displayType) {

        // Numeric range (slider)
        case "controlRange":
            return (
                <div>
                    <Slider
                        title={display.meta.name ?? ""}
                        min={display.content.controlParameters?.min ?? 0}
                        max={display.content.controlParameters?.max ?? 0}
                        step={display.content.controlParameters?.step ?? 1}
                        currentValue={
                            computedIOValues.get(String(displayIOValuesList[0])) ??
                            IOValues.get(display.meta.uuid) ??
                            display.content.controlParameters?.value ??
                            -1
                        }
                        setCurrentValue={isInteractive ? setSingleValue : () => {} }
                    />
                </div>
            );
        
        // Textbox (if interactive) or grey text label (if non-interactive)
        case "controlText":
            const textValue = (
                computedIOValues.get(String(displayIOValuesList[0])) ??
                display.content.controlParameters?.value ??
                ""
            );
            return (
                <div>
                    {label && <div>{label}</div>}
                    {isInteractive ? (
                        <input
                            type="text"
                            value={textValue}
                            onChange={(event) => setSingleValue(event.target.value)}
                        />
                    ) : (
                        <div style={{wordWrap: "break-word", width: "300px"}}>
                            <label style={{backgroundColor:"#323232", paddingInline:"3px"}}>{textValue}</label>
                        </div>
                    )}
                </div>
            );
        
        // Boolean (checkbox)
        case "controlBoolean":
            const boolValue = (
                computedIOValues.get(String(displayIOValuesList[0])) ??
                !!(display.content.controlParameters?.value)
            );
            return (
                <div>
                    {label && <div>{label}</div>}
                    <input
                        type="checkbox"
                        checked={boolValue}
                        onChange={(event) => setSingleValue(event.target.checked)}
                    />
                </div>
            )
        
        default:
            return <div style={{ color: "yellow" }}>Unsupported display type</div>
    }
};

export default DisplayRenderer;