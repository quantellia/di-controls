import { useState } from "react";
import Chart from "./Chart";
import Gauge from "./Gauge";
import Slider from "./Slider";
import "../index.css";

function roundToNearest(value: number, target: number) {
  return value - (value % target);
}

function App() {
  const [investment, setInvestment] = useState(5000);
  const [costPerHour, setCostPerHour] = useState(100);
  const [skillLevel, setSkillLevel] = useState(50);
  const [costOfDelay, setCostOfDelay] = useState(5000);
  const [skillBenefitValues, setSkillBenefitValues] = useState([
    10, 9, 8, 8, 4, 3, 2, 2, 1, 1, 1,
  ]);
  const [projectDelayValues, setProjectDelayValues] = useState([
    0, 1, 2, 3, 5, 7, 9, 20, 30, 40,
  ]);
  const hoursPurchased = Math.floor(investment / costPerHour);
  const skillLevelImprovement =
    skillBenefitValues[roundToNearest(skillLevel, 10) / 10];
  const skillImprovementScore = skillLevelImprovement * hoursPurchased;
  const daysDelayed =
    projectDelayValues[
      Math.floor(roundToNearest(skillImprovementScore, 1000) / 1000)
    ];
  const totalInvestmentBenefit = daysDelayed * costOfDelay;
  const investmentDelta = totalInvestmentBenefit - investment;

  const modelText = `By investing $${investment} in training that costs $${costPerHour} per hour, 
  ${Math.floor(hoursPurchased)} training hours can be purchased. 
  Since the average skill level of the workforce before the investment is ${skillLevel} (on a scale of 1-100), 
  this can produce a skill level improvement of ${skillLevelImprovement} 
  (as measured on an assessment test with a scale of 1-10) for every training hour purchased,
  resulting in a total predicted skills improvement score of ${skillImprovementScore}. 
  Analysis of our historical data shows that this will avoid, on average, ${daysDelayed} days of project delay. 
  Project delay days cost the company, on average, $${costOfDelay} each.  
  This means that the expected benefit from the $${investment} initial investment is $${totalInvestmentBenefit}, 
  representing a net ${investmentDelta >= 0 ? "return" : "loss"} 
  of $${Math.abs(investmentDelta)}.`;

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
        <Gauge
          title="Total Revenue"
          maxValue={10000}
          value={investmentDelta}
          displayValue={`${investmentDelta}`}
          measure=""
        />
      </div>
      <div className="column">
        <Gauge
          title="Training Hours Purchased"
          maxValue={500}
          value={hoursPurchased}
          displayValue={`${hoursPurchased}`}
          measure="Hours"
        />
        <Gauge
          title="Total skills improvement"
          maxValue={5000}
          value={skillImprovementScore}
          displayValue={`${skillImprovementScore}`}
          measure="Skill Improvement"
        />
        <Gauge
          title="Reduction in Project Delay"
          maxValue={50}
          value={daysDelayed}
          displayValue={`${daysDelayed}`}
          measure="Days Faster"
        />
      </div>
      <div className="column">
        <Chart
          title="Skill level->Benefit of training hr"
          xAxisData={Array.from({ length: 100 }, (_v, k) => k * 10)}
          yAxisData={skillBenefitValues}
          yAxisLabel="Benefit"
          tooltip={{
            message: function (currentX, currentY) {
              return `At skill level ${currentX},<br />
                1 training hr=benefit lvl ${currentY}`;
            },
            position: function () {
              return { x: 256, y: 0 };
            },
          }}
          currentValue={skillBenefitValues}
          setCurrentValue={setSkillBenefitValues}
        />
        <Chart
          title="Skills improvement->proj delay reduction"
          xAxisData={Array.from({ length: 10 }, (_v, k) => k * 1000)}
          yAxisData={projectDelayValues}
          yAxisLabel="Days"
          tooltip={{
            message: function (currentX, currentY) {
              return `With skill improvement of ${currentX},<br/>
                ${currentY} fewer days proj delay expected`;
            },
            position: function () {
              return { x: 40, y: 24 };
            },
          }}
          currentValue={projectDelayValues}
          setCurrentValue={setProjectDelayValues}
        />
        <Gauge
          title="Total Investment Benefit"
          maxValue={10000}
          value={totalInvestmentBenefit}
          displayValue={`$${totalInvestmentBenefit}`}
          measure=""
        />
      </div>
    </div>
  );
}

export default App;
