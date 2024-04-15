import { createSignal } from "solid-js";
import Gauge from "./components/Gauge";
import "./App.css";

function App() {
  // const [count, setCount] = createSignal(0)

  return (
    <>
      <Gauge
        title="test"
        maxValue={100}
        value={10}
        displayValue={`$${10}`}
        measure="km"
      />
    </>
  );
}

export default App;
