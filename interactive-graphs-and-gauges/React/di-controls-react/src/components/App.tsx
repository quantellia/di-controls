import Chart from "./Chart";
import Gauge from "./Gauge";
import "../index.css";
import Slider from "./Slider";
import { useState } from "react";

function App() {
  const [investment, setInvestment] = useState(5000);
  const [costPerHour, setCostPerHour] = useState(100);
  const [skillLevel, setSkillLevel] = useState(50);
  const [costOfDelay, setCostOfDelay] = useState(5000);
  const [skillBenefit, setSkillBenefit] = useState(3);
  const [projectDelay, setProjectDelay] = useState(0);
  const hoursPurchased = Math.floor(investment / costPerHour);

  const modelText = `By investing $${investment} in training that costs $${costPerHour} per hour, ${Math.floor(
    hoursPurchased
  )} training hours can be purchased.  Since the average skill level of the workforce before the investment is ${skillLevel} (on a scale of 1-100), this can produce a skill level improvement of `;

  return (
    <div className="root">
      <div className="column">
        <Slider
          title="Training Investment:"
          min={0}
          max={20000}
          step={1}
          currentValue={investment}
          setCurrentValue={setInvestment}
        />
        <Slider
          title="Cost per hour of training:"
          min={0}
          max={200}
          step={1}
          currentValue={costPerHour}
          setCurrentValue={setCostPerHour}
        />
        <Slider
          title="Average skill level today:"
          min={0}
          max={100}
          step={1}
          currentValue={skillLevel}
          setCurrentValue={setSkillLevel}
        />
        <Slider
          title="Cost of a day of project delay:"
          min={0}
          max={10000}
          step={500}
          currentValue={costOfDelay}
          setCurrentValue={setCostOfDelay}
        />
        <p>{modelText}</p>
      </div>
      <div className="column">
        <Gauge
          title="Training Hours Purchased"
          maxValue={250}
          value={hoursPurchased}
          displayValue="{point.y:,.0f}"
          measure="Hours"
        />
        <Gauge
          title="Total skills improvement"
          maxValue={5000}
          value={skillBenefit}
          displayValue="{point.y:,.0f}"
          measure="Skill Improvement"
        />
        <Gauge
          title="Reduction in Project Delay"
          maxValue={50}
          value={projectDelay}
          displayValue="{point.y:,.0f}"
          measure="Days Faster"
        />
      </div>
      <div className="column">
        <Chart
          title="Skill level->Benefit of training hr"
          xAxisData={Array.from({ length: 100 }, (v, k) => k * 10)}
          yAxisData={[10, 9, 8, 8, 4, 3, 2, 2, 1, 1, 1]}
          yAxisLabel="Benefit"
          tooltip={{
            formatter: function () {
              const x: number = Math.round(this.x);
              const y: number = Math.round(this.y);
              return (
                "At skill level " + x + ",<br />1 training hr=benefit lvl " + y
              );
            },
            positioner: function () {
              return { x: 256, y: 0 };
            },
          }}
          setCurrentValue={setSkillBenefit}
        />
        <Chart
          title="Skills improvement->proj delay reduction"
          xAxisData={Array.from({ length: 10 }, (v, k) => k * 1000)}
          yAxisData={[0, 1, 2, 3, 5, 7, 9, 20, 30, 40]}
          yAxisLabel="Days"
          tooltip={{
            formatter: function () {
              const x: number = Math.round(this.x);
              const y: number = Math.round(this.y);
              return (
                "With skill improvement of " +
                x +
                ",<br />" +
                y +
                " fewer days proj delay expected"
              );
            },
            positioner: function () {
              return { x: 40, y: 24 };
            },
          }}
          setCurrentValue={setProjectDelay}
        />
        <Gauge
          title="Total investment benefit"
          maxValue={10000}
          value={80}
          displayValue="${point.y:,.0f}"
          measure=""
        />
      </div>
    </div>
  );
}

export default App;
