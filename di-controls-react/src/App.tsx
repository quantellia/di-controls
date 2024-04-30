import { useState } from "react";
import DraggableChart from "./components/DraggableCharts";
import Slider from "./components/Slider";

function App() {
  const [section1Value, setSection1Value] = useState(100);
  const [section2Value, setSection2Value] = useState(100);
  const [section3Value, setSection3Value] = useState(100);
  const [section4Value, setSection4Value] = useState(100);
  const [section5Value, setSection5Value] = useState(100);
  const [section6Value, setSection6Value] = useState(100);
  const [section7Value, setSection7Value] = useState(100);

  const graphValues = [
    { name: "blue", value: section1Value, set: setSection1Value },
    { name: "2", value: section2Value, set: setSection2Value },
    { name: "3", value: section3Value, set: setSection3Value },
    { name: "4", value: section4Value, set: setSection4Value },
    { name: "5", value: section5Value, set: setSection5Value },
    { name: "6", value: section6Value, set: setSection6Value },
    { name: "7", value: section7Value, set: setSection7Value },
  ];

  return (
    <>
      <DraggableChart data={graphValues} compensate={true} />
      <p>
        {graphValues.map((slice) => (
          <Slider
            title={`Section ${slice.name} value`}
            min={10}
            max={1000}
            step={1}
            currentValue={slice.value}
            setCurrentValue={slice.set}
          />
        ))}
      </p>
    </>
  );
}

export default App;
