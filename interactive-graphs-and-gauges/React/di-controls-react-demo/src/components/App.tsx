import { useState } from "react"; // in order to make changes to our values we need useState from the React framework

// import all the necessary components from the components folder we're in.
// each thing that we use within our HTML code is called a component
import Chart from "./Chart";
import Gauge from "./Gauge";
import Slider from "./Slider";

import "../index.css"; // import the styling for our App as well

// utility function to round to the nearest type of number, i.e. if target==10 and number==26, returns 20
// if target==5 and number==26, returns 25
function roundToNearest(value: number, target: number) {
  return value - (value % target);
}

// our App component
// All components are functions which return JSX, i.e. fake HTML which React compiles into real HTML on its own
function App() {
  // Declare the values that we want to be able to adjust with our controls with the useState() hook
  // "hooks" can be thought of as helper functions from react that have the "use" keyword before them
  // useState() allows us to make a value that can be adjusted
  // it creates two things: the actual variable (which it sets to the default value you pass to the useState() function)
  // and a function called set{variable}() which allows us to update that value at any time

  // VERY IMPORTANT NOTE!! Whenever a value is changed with set{variable}(), this whole function gets re-run
  // this means that our values below that do not use useState() will change to relect the values we updated our variable with

  // this can all be confusing so a good way to think about it is:
  // everything that we change directly with a control, we create with useState()
  // and everything that derives its value, we can just set on its own
  const [investment, setInvestment] = useState(5000); // creates our investment state with an initial value of 5000
  const [costPerHour, setCostPerHour] = useState(100); // same as above for costPerHour
  const [skillLevel, setSkillLevel] = useState(50); // etc.
  const [costOfDelay, setCostOfDelay] = useState(5000); // etc.
  const [skillBenefitValues, setSkillBenefitValues] = useState([
    // These are the initial Y axis values on our skill benefit graph
    10, 9, 8, 8, 4, 3, 2, 2, 1, 1, 1,
  ]);
  const [projectDelayValues, setProjectDelayValues] = useState([
    // initial Y axis values for the project delay graph
    0, 1, 2, 3, 5, 7, 9, 20, 30, 40,
  ]);

  // now that we have our state variables that are affected by the controls, we can do math with them to do whatever we want
  // as stated above, whenever any of the values above this line are changed, the whole function is re-run
  // which gives us the sideeffect that all of these values will automatically update
  // to reflect the changes we make to the values above using our controls
  // for instance, we calculate the hours purchased from the investment divided by the cost per hour
  const hoursPurchased = Math.floor(investment / costPerHour);

  // For this, we are choosing the point on the skill benefit graph who is closest to the current skill level
  // we use the roundToNearest() function here because the X axis is in groups of 10 while we want indexes instead
  // therefore, we know that when X==10, the index will be 1, so we need to turn our numbers into round 10's and then divide
  // for instance if skillLevel==26, we roundToNearest() to get 20 and then divide by 10 to get the index 2
  // from there, we just get the Y value which for the skill benefit graph, defaults to 9
  const skillLevelImprovement =
    skillBenefitValues[roundToNearest(skillLevel, 10) / 10];

  // straightforward calculation of the skill improvement score
  const skillImprovementScore = skillLevelImprovement * hoursPurchased;

  // similar to the skillLevelImprovement above, we get the point on the project delay graph that matches our improvement score
  const daysDelayed =
    projectDelayValues[
      Math.floor(roundToNearest(skillImprovementScore, 1000) / 1000)
    ];

  // more miscellaneous calculations
  const totalInvestmentBenefit = daysDelayed * costOfDelay;
  const investmentDelta = totalInvestmentBenefit - investment;

  // here, we use a template string, denoted by using backtics instead of single quotes, i.e. ` instead of '
  // which we can use to inject our values directly into the text
  // these get used a lot and are themselves very useful so it's worth it to learn the slightly weird syntax
  // in order to get the value to appear, we need to wrap it in "${}", the variable living inbetween the curly braces
  // the dollar sign tells the template that this is a variable we want to show and not just another string so it's important
  // you can see, though, that if you want to have money represented, you can just have 2 dollar signs and it works just fine

  // you can also see that we aren't just using variables but can put actual code within these curly braces with the
  // hoursPurchased and investmentDelta variables.  This is one of the things that makes template strings so useful

  // in the second to last value, things look a little strange, this is because we're using a ternary operator
  // put simply, ternary operators are a way to put "if / else" logic in a compact structure
  // it reads like this: if investmentDelta >= 0, value="return", otherwise, value="loss"
  // meaning if our investmentDelta is greater than 0, we want to show that it is a return, otherwise it's a loss
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

  // this is where the magic happens
  // all React components return what is called JSX, which is similar to HTML, but allows us to do some extra things
  // for one, it allows us to use other React components within it, like our Sliders, Gauges, and Charts
  // for another, it allows us to represent more than just strings in the code

  // we can see that we are wrapping everything in traditional HTML div's here, one with a class of "root"
  // and one with a class of "column"
  // however, you may notice that instead of saying class="root", we instead use className
  // this is because this isn't real HTML and "class" refers to another thing in JSX so we must use className instead

  // past that is the interesting part, our custom components
  // in this example there are 3:

  // Sliders are a wrapper around basic HTML sliders that have some extra functionality:
  // "title" sets the value that appears above the slider itself
  // "min" is the minimum value for the slider
  // "max" is the maximum value for the slider
  // "step" is how much the slider can change by, so 1 means it increments by 1 whereas 5 would lock you into units of 5s
  // "currentValue" takes the useState() variable from above that you want the sliders position to reflect
  // "setCurrentValue" takes the useState() "set" function from above that you want to be called whenever you move the slider

  // Gauges are a wrapper around highcharts gauges which allow us to easily reflect values
  // they don't have the ability to set the value, they just show the data
  // "title" sets the text that appears above the gauge
  // "maxValue" is the maximum value for the slider, it can go above this but will just show it capped out in the UI
  // "value" is the actual data that you want to represent, i.e. the variable to show
  // "displayValue" is the string version of the text, most of the time it's just the same number but for money you
  // may want to add in the "$" before the actual number
  // "measure" is the units you want to use, i.e. Hours, Days, etc., but can be left as an empty string "" for nothing at all

  // Charts are a wrapper around highcharts area plots that allow us to do all sorts of things but mainly they are just
  // interactive line charts whose data updates in real time
  // because of this, they are also a little more complicated than the other components here
  // "title" is the same as the other components, the string above the chart
  // "xAxisData" takes an array to show the values on the X axis of the graph
  // "yAxisData" takes an array to show the values that each point will hit at each X axis index
  // "yAxisLabel" is the string that appears on the Y axis
  // "tooltip" takes an object with two fields of its own:
  // "message" is the text that you want to display in the tooltip and it takes a function with two parameters,
  // currentX, which will be the current X axis position currently highlighted
  // and currentY, which is the same but for the Y axis position
  // from there, the function just needs to return the string that you want to show in the tooltip
  // the second thing within "tooltip" is the "position" which is also a function, but with no parameters
  // and returns an object with two values: x and y which are the x and y locations you want the tooltip's top right corner
  // to appear in
  // after the tooltip, things get significantly easier again
  // "currentValue" is just like the Sliders, it takes the variable that you want to affect, most likely an array of numbers
  // "setCurrentValue" is also like the Sliders, taking the useState() function for your currentValue variable
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
          title="Revenue"
          maxValue={10000}
          value={investmentDelta}
          displayValue={`$${investmentDelta}`}
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
