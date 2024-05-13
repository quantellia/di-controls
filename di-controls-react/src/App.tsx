import * as d3 from "d3";
import { useState } from "react";
import { DraggablePieChart } from "./components/DraggableCharts";
import Slider from "./components/Slider";

function App() {
  const total = 1200;
  const numSlices = 7;

  const [section1Value, setSection1Value] = useState(total / numSlices);
  const [section2Value, setSection2Value] = useState(total / numSlices);
  const [section3Value, setSection3Value] = useState(total / numSlices);
  const [section4Value, setSection4Value] = useState(total / numSlices);
  const [section5Value, setSection5Value] = useState(total / numSlices);
  const [section6Value, setSection6Value] = useState(total / numSlices);
  const [section7Value, setSection7Value] = useState(total / numSlices);

  const [chartRadius, setChartRadius] = useState(500);
  const [isDonut, setIsDonut] = useState(0);

  const graph1 = [
    { name: "1", value: section1Value, set: setSection1Value },
    { name: "2", value: section2Value, set: setSection2Value },
    { name: "3", value: section3Value, set: setSection3Value },
  ];
  const graph2 = [
    {
      name: "4",
      value: section4Value,
      color: "#ffd166",
      set: setSection4Value,
    },
    {
      name: "5",
      value: section5Value,
      color: "#fb8500",
      set: setSection5Value,
    },
    {
      name: "6",
      value: section6Value,
      color: "rgb(209, 60, 75)",
      set: setSection6Value,
    },
    {
      name: "7",
      value: section7Value,
      color: "#EF476F",
      set: setSection7Value,
    },
  ];

  return (
    <>
      <DraggablePieChart
        data={graph1}
        radius={chartRadius}
        isDonut={!!isDonut}
        onlyAdjustSubsequentSlices={true}
        d3ColorScheme={d3.interpolateBuPu}
        // textColor="white"
        stroke="#323232"
      />
      <DraggablePieChart
        data={graph2}
        radius={chartRadius}
        isDonut={!!isDonut}
        onlyAdjustSubsequentSlices={false}
        // d3ColorScheme={d3.interpolateBuPu}
        textColor="white"
        // stroke="#ff3399"
      />
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
        {[...graph1, ...graph2].map((slice) => (
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
