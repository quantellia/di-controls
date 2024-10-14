import * as d3 from "d3";
import { useState } from "react";
import {
  DraggableTreeMap,
  DraggablePieChart,
  DraggableLineChart,
} from "../components/DraggableCharts";
import { Slider, RadioButtonGroup } from "../components/BasicControls";
import { Gauge } from "../components/DataVisualizations";

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

  const [point1, setPoint1] = useState(90);
  const [point2, setPoint2] = useState(12);
  const [point3, setPoint3] = useState(34);
  const [point4, setPoint4] = useState(53);
  const [point5, setPoint5] = useState(52);
  const [point6, setPoint6] = useState(9);
  const [point7, setPoint7] = useState(18);
  const [point8, setPoint8] = useState(78);
  const [point9, setPoint9] = useState(28);
  const [point10, setPoint10] = useState(34);

  const [chartRadius /*setChartRadius*/] = useState(500);
  const [isDonut /*setIsDonut*/] = useState(0);

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

  const graph3 = [
    { value: point1, set: setPoint1 },
    { value: point2, set: setPoint2 },
    { name: "3", value: point3, set: setPoint3 },
    { name: "4", value: point4, set: setPoint4 },
    { name: "5", value: point5, set: setPoint5 },
    { name: "6", value: point6, set: setPoint6 },
    { name: "7", value: point7, set: setPoint7 },
    { name: "8", value: point8, set: setPoint8 },
    { name: "9", value: point9, set: setPoint9 },
    { name: "10", xValue: 18, value: point10, set: setPoint10 },
  ];

  const [nodeA, setNodeA] = useState(90);
  const [nodeB, setNodeB] = useState(15);
  const [nodeC, setNodeC] = useState(30);
  const [nodeD, setNodeD] = useState(47);
  const [nodeE, setNodeE] = useState(32);
  const [nodeF, setNodeF] = useState(26);
  const [nodeG, setNodeG] = useState(13);
  const [nodeH, setNodeH] = useState(26);
  const [nodeI, setNodeI] = useState(100);
  const [nodeJ, setNodeJ] = useState(67);
  const [nodeK, setNodeK] = useState(22);
  const [nodeL, setNodeL] = useState(30);
  const [nodeM, setNodeM] = useState(80);
  const [nodeN, setNodeN] = useState(45);
  const [nodeO, setNodeO] = useState(19);
  const [nodeP, setNodeP] = useState(20);

  const [radioGroupSelection, setRadioGroupSelection] = useState("test1");

  const treemap = {
    children: [
      {
        name: "group1",
        children: [
          {
            name: "group1a",
            children: [
              { name: "a", value: nodeA, set: setNodeA },
              { name: "b", value: nodeB, set: setNodeB },
            ],
          },
          {
            name: "group1b",
            children: [
              { name: "c", value: nodeC, set: setNodeC },
              { name: "d", value: nodeD, set: setNodeD },
            ],
          },
        ],
      },
      {
        name: "group2",
        color: "mediumseagreen",
        children: [
          { name: "e", value: nodeE, set: setNodeE },
          { name: "f", value: nodeF, set: setNodeF },
          { name: "g", value: nodeG, set: setNodeG },
        ],
      },
      {
        name: "group3",
        children: [
          { name: "h", value: nodeH, set: setNodeH },
          { name: "i", value: nodeI, set: setNodeI },
          { name: "j", value: nodeJ, set: setNodeJ },
          { name: "k", value: nodeK, set: setNodeK },
          { name: "l", value: nodeL, set: setNodeL },
        ],
      },
      {
        name: "group4",
        children: [
          { name: "m", value: nodeM, set: setNodeM },
          { name: "n", value: nodeN, set: setNodeN },
          { name: "o", value: nodeO, set: setNodeO },
          { name: "p", value: nodeP, set: setNodeP },
        ],
      },
    ],
  };

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
      <DraggableLineChart
        data={[...graph1, ...graph2, ...graph3]}
        isAreaChart={true}
        color="rgb(12, 98, 145)"
        areaColor="rgba(12, 98, 145, 0.3)"
        stroke="none"
        width={900}
      />
      <div style={{ display: "inline flow-root" }}>
        {[...graph3].map((point, index) => (
          <Slider
            title={`Point ${index} value`}
            min={0}
            max={250}
            step={1}
            currentValue={point.value}
            setCurrentValue={point.set}
          />
        ))}
      </div>
      <div>
        <DraggableTreeMap data={treemap} />
      </div>
      <div>
        <RadioButtonGroup
          data={["test1", "test2", "test3"]}
          title="test group"
          currentValue={radioGroupSelection}
          setCurrentValue={(value) => setRadioGroupSelection(value)}
        />
        <RadioButtonGroup
          data={["test1", "test2", "test3"]}
          title="test 2"
          currentValue={radioGroupSelection}
          vertical={false}
          setCurrentValue={(value) => setRadioGroupSelection(value)}
        />
      </div>
      <Gauge
        title="nodeC"
        min={0}
        max={100}
        currentValue={nodeC}
        radius={200}
      />
    </>
  );
}

export default App;
