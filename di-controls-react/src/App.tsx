import * as d3 from "d3";
import { useState } from "react";
import { DraggablePieChart } from "./components/DraggableCharts";
import Slider from "./components/Slider";

function App() {
  const [section1Value, setSection1Value] = useState(1000);
  const [section2Value, setSection2Value] = useState(1000);
  const [section3Value, setSection3Value] = useState(1000);
  const [section4Value, setSection4Value] = useState(1000);
  const [section5Value, setSection5Value] = useState(1000);
  const [section6Value, setSection6Value] = useState(1000);
  const [section7Value, setSection7Value] = useState(1000);
  const [chartRadius, setChartRadius] = useState(500);
  const [isDonut, setIsDonut] = useState(0);

  const graphValues = [
    { name: "blue", value: section1Value, set: setSection1Value },
    { name: "2", value: section2Value, set: setSection2Value },
    { name: "3", value: section3Value, set: setSection3Value },
    { name: "4", value: section4Value, set: setSection4Value },
    { name: "5", value: section5Value, set: setSection5Value },
    {
      name: "6",
      color: "#ff3399",
      value: section6Value,
      set: setSection6Value,
    },
    { name: "7", value: section7Value, set: setSection7Value },
  ];

  return (
    <>
      <DraggablePieChart
        data={graphValues}
        radius={chartRadius}
        donut={!!isDonut}
        // d3ColorScheme={d3.interpolateBuGn}
      />
      <p>
        Total:
        {Math.round(
          graphValues.reduce(
            (accumulator, slice) => accumulator + slice.value,
            0
          )
        )}
      </p>
      <p>
        <Slider
          title="Radius"
          min={100}
          max={1000}
          step={1}
          currentValue={chartRadius}
          setCurrentValue={setChartRadius}
        />
        <Slider
          title="Donut Graph"
          min={0}
          max={1}
          step={1}
          currentValue={isDonut}
          setCurrentValue={setIsDonut}
        />
      </p>
      <p>
        {graphValues.map((slice) => (
          <Slider
            title={`Section ${slice.name} value`}
            min={10}
            max={2000}
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
