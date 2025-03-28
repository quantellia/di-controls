import { useState } from "react";
import rawModelJSON from "./model_json/coffee.json" assert { type: "json" };
import CausalDecisionDiagram from "./components/CausalDecisionDiagram";

function App() {
    const [modelJSON] = useState(rawModelJSON);

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
            {/* Placeholder, will slot JSON editor in here */}
            <div style={{ flex: 1, overflow: "auto", borderRight: "1px solid #ddd" }}>
                <pre style={{ padding: "1rem", fontSize: "12px" }}>
                    {JSON.stringify(modelJSON, null, 2)}
                </pre>
            </div>

            {/* Diagram view / engine */}
            <div style={{ flex: 2, position: "relative" }}>
                <CausalDecisionDiagram model={modelJSON} />
            </div>
        </div>
    )
};

export default App;