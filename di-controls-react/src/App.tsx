import { useRef, useState } from "react";
import {
  ComponentGauge,
  Gauge,
  LineChart,
} from "./components/DataVisualizations";
import { RadioButtonGroup } from "./components/BasicControls";
import * as d3 from "d3";
import { DraggableGauge } from "./components/DraggableCharts";
import { ArcherContainer, ArcherElement } from "react-archer";

function App() {
  const applyFumigantNematicideOptions = [
    "Apply fumigant nematicide",
    "Do not apply fumigant nematicide",
  ];
  const applyNonFumigantNematicideOptions = [
    "Apply non-fumigant nematicide",
    "Do not apply non-fumigant nematicide",
  ];
  const [spring2023Crop, setSpring2023Crop] = useState("Peanuts");
  const [spring2023FumigantNematicide, setSpring2023FumigantNematicide] =
    useState(applyFumigantNematicideOptions[0]);
  const [spring2023NonFumigantNematicide, setSpring2023NonFumigantNematicide] =
    useState(applyNonFumigantNematicideOptions[1]);
  const [spring2024FumigantNematicide, setSpring2024FumigantNematicide] =
    useState(applyFumigantNematicideOptions[0]);
  const [spring2024NonFumigantNematicide, setSpring2024NonFumigantNematicide] =
    useState(applyNonFumigantNematicideOptions[1]);

  const [costOfNematicides, setCostOfNematicides] = useState(219);
  const [otherCostsForSweets, setOtherCostsForSweets] = useState(2090);
  const [costForPeanuts, setCostForPeanuts] = useState(870);

  const [mIncognita2022, setMIncognita2022] = useState(137);
  const [mEnterlobii2022Found, setMEnterlobii2022Found] = useState("Found");

  const bestPracticesOptions = [
    "Followed all recommended practices",
    "Followed most recommended practices",
    "Did not follow recommended practices",
  ];
  const [soilTemp, setSoilTemp] = useState(78);
  const [fumigantBestPractices, setFumigantBestPractices] = useState(
    bestPracticesOptions[0]
  );
  const [nonFumigantBestPractices, setNonFumigantBestPractices] = useState(
    bestPracticesOptions[0]
  );

  const soilTempWithinBoundsAndFumigated = function (
    radioButton: string,
    error?: number
  ) {
    return (
      40 - (error || 0) <= soilTemp &&
      soilTemp <= 80 + (error || 0) &&
      radioButton === applyFumigantNematicideOptions[0]
    );
  };

  const percentKilled2023 =
    soilTempWithinBoundsAndFumigated(spring2023FumigantNematicide) &&
    fumigantBestPractices === bestPracticesOptions[0]
      ? 90
      : 0;
  const mEnterlobiiSpring2023Present = !(
    percentKilled2023 > 0 &&
    spring2023NonFumigantNematicide === applyNonFumigantNematicideOptions[0] &&
    nonFumigantBestPractices === bestPracticesOptions[0]
  );
  const mEnterlobiiFall2023Present = mEnterlobiiSpring2023Present;

  const percentKilled2023MostBestPractices =
    soilTempWithinBoundsAndFumigated(spring2023FumigantNematicide) &&
    fumigantBestPractices === bestPracticesOptions[1]
      ? 70
      : 0;
  const soilRoughlyWithinBoundsAndFumigated =
    soilTempWithinBoundsAndFumigated(spring2023FumigantNematicide, 5) &&
    fumigantBestPractices !== bestPracticesOptions[2]
      ? 50
      : 0;
  const fumigantKillRate2023 = Math.max(
    percentKilled2023,
    percentKilled2023MostBestPractices,
    soilRoughlyWithinBoundsAndFumigated,
    0
  );

  const nonFumigantPercentKilled = function (
    nematicideRadioButton: string,
    radioButtonIndex: number,
    percentKilled: number
  ) {
    return nematicideRadioButton === applyNonFumigantNematicideOptions[0] &&
      nonFumigantBestPractices === bestPracticesOptions[radioButtonIndex]
      ? percentKilled
      : 0;
  };

  const nonFumigantKillRate2023 = Math.max(
    nonFumigantPercentKilled(spring2023NonFumigantNematicide, 0, 90),
    nonFumigantPercentKilled(spring2023NonFumigantNematicide, 1, 70),
    nonFumigantPercentKilled(spring2023NonFumigantNematicide, 2, 50),
    0
  );

  const mIncognitaSpring2023 =
    0.01 *
    (100 - nonFumigantKillRate2023) *
    (spring2023NonFumigantNematicide === applyNonFumigantNematicideOptions[0]
      ? fumigantKillRate2023
      : mIncognita2022);

  const mIncognitaFall2023 = Math.floor(
    spring2023Crop === "Sweetpotatoes"
      ? mIncognitaSpring2023 * (1 - 0.01 * 50)
      : mIncognitaSpring2023 + 0.01 * mIncognitaSpring2023 * 600
  );

  const percentKilled2024 =
    soilTempWithinBoundsAndFumigated(spring2024FumigantNematicide) &&
    fumigantBestPractices === bestPracticesOptions[0]
      ? 90
      : 0;
  const mEnterlobiiSpring2024Present = !(
    percentKilled2024 > 0 &&
    spring2024NonFumigantNematicide === applyNonFumigantNematicideOptions[0] &&
    nonFumigantBestPractices === bestPracticesOptions[0]
  );

  const percentKilled2024MostBestPractices =
    soilTempWithinBoundsAndFumigated(spring2024FumigantNematicide) &&
    fumigantBestPractices === bestPracticesOptions[1]
      ? 70
      : 0;
  const soilRoughlyWithinBoundsAndFumigated2024 =
    soilTempWithinBoundsAndFumigated(spring2024FumigantNematicide, 5) &&
    fumigantBestPractices !== bestPracticesOptions[2]
      ? 50
      : 0;
  const fumigantKillRate2024 = Math.max(
    percentKilled2024,
    percentKilled2024MostBestPractices,
    soilRoughlyWithinBoundsAndFumigated2024,
    0
  );

  const nonFumigantKillRate2024 = Math.max(
    nonFumigantPercentKilled(spring2024NonFumigantNematicide, 0, 90),
    nonFumigantPercentKilled(spring2024NonFumigantNematicide, 1, 70),
    nonFumigantPercentKilled(spring2024NonFumigantNematicide, 2, 50),
    0
  );

  const mIncognitaSpring2024 =
    0.01 *
    (100 - nonFumigantKillRate2024) *
    (spring2024NonFumigantNematicide === applyNonFumigantNematicideOptions[0]
      ? fumigantKillRate2024
      : mIncognitaFall2023);

  const plantedSweetsNotDestroyed2023 =
    spring2023Crop === "Sweetpotatoes" &&
    mIncognitaSpring2023 < 100 &&
    !mEnterlobiiFall2023Present;

  const valuePerAcre2023 = plantedSweetsNotDestroyed2023
    ? 5000
    : (spring2023Crop === "Sweetpotatoes" && 2500) || 1160;

  const plantedSweetsAndAppliedNematicides =
    spring2023Crop === "Sweetpotatoes" &&
    (spring2023FumigantNematicide === applyFumigantNematicideOptions[0] ||
      spring2023NonFumigantNematicide === applyNonFumigantNematicideOptions[0]);
  const plantedPeanutsAndAppliedNematicides =
    spring2023Crop === "Peanuts" &&
    (spring2023FumigantNematicide === applyFumigantNematicideOptions[0] ||
      spring2023NonFumigantNematicide === applyNonFumigantNematicideOptions[0]);
  const costPerAcre2023 = plantedSweetsAndAppliedNematicides
    ? otherCostsForSweets + costOfNematicides
    : (plantedPeanutsAndAppliedNematicides &&
        costForPeanuts + costOfNematicides) ||
      costForPeanuts;

  const profit2023 = valuePerAcre2023 - costPerAcre2023;

  const plantedSweetsNotDestroyed2024 =
    spring2023Crop === "Peanuts" &&
    mIncognitaFall2023 < 100 &&
    !mEnterlobiiSpring2024Present;

  const valuePerAcre2024 = plantedSweetsNotDestroyed2024
    ? 5000
    : (spring2023Crop === "Peanuts" && 2500) || 1160;

  const plantedSweetsAndAppliedNematicides2024 =
    spring2023Crop === "Peanuts" &&
    (spring2024FumigantNematicide === applyFumigantNematicideOptions[0] ||
      spring2024NonFumigantNematicide === applyNonFumigantNematicideOptions[0]);
  const plantedPeanutsAndAppliedNematicides2024 =
    spring2023Crop === "Sweetpotatoes" &&
    (spring2024FumigantNematicide === applyFumigantNematicideOptions[0] ||
      spring2024NonFumigantNematicide === applyNonFumigantNematicideOptions[0]);
  const costPerAcre2024 = plantedSweetsAndAppliedNematicides2024
    ? otherCostsForSweets + costOfNematicides
    : (plantedPeanutsAndAppliedNematicides2024 &&
        costForPeanuts + costOfNematicides) ||
      costForPeanuts;

  const profit2024 = valuePerAcre2024 - costPerAcre2024;

  const totalCost = costPerAcre2023 + costPerAcre2024;
  const totalValue = valuePerAcre2023 + valuePerAcre2024;
  const totalProfit = profit2023 + profit2024;

  const explanation = `
  When choosing to plant ${spring2023Crop} in Spring 2023 with ${mIncognita2022} M. incognita per 500cc 
  and M. enterlobii ${
    mEnterlobii2022Found === "Found" ? "" : "not"
  } found in 2022 and 
  ${
    spring2023FumigantNematicide === applyFumigantNematicideOptions[0]
      ? ""
      : "not"
  } applying fumigant nematicides while ${
    spring2023NonFumigantNematicide === applyNonFumigantNematicideOptions[0]
      ? ""
      : "not"
  } applying non-fumigant nematicides and following ${
    spring2023FumigantNematicide === applyFumigantNematicideOptions[0]
      ? (fumigantBestPractices === bestPracticesOptions[0] &&
          "all recommended practices for fumigants") ||
        (fumigantBestPractices === bestPracticesOptions[1] &&
          "some recommended practices for fumigants") ||
        (fumigantBestPractices === bestPracticesOptions[2] &&
          "no recommended practices for fumigants")
      : ""
  } ${
    (spring2023FumigantNematicide === applyFumigantNematicideOptions[0] &&
      spring2023NonFumigantNematicide ===
        applyNonFumigantNematicideOptions[0] &&
      "and") ||
    ""
  } ${
    spring2023NonFumigantNematicide === applyNonFumigantNematicideOptions[0]
      ? (nonFumigantBestPractices === bestPracticesOptions[0] &&
          "all recommended practices for non-fumigants") ||
        (nonFumigantBestPractices === bestPracticesOptions[1] &&
          "some recommended practices for non-fumigants") ||
        (nonFumigantBestPractices === bestPracticesOptions[2] &&
          "no recommended practices for non-fumigants")
      : ""
  } with an average soil temperature of ${soilTemp}°F, assuming a change in crops planted in Spring 2024, you will see:\n
  ${mIncognitaSpring2023} M. incognita present per 500cc 
  and M. enterlobii ${
    mEnterlobiiSpring2023Present ? "" : "not"
  } present in Spring 2023,\n
  ${mIncognitaFall2023} M. incognita present per 500cc 
  and M. enterlobii ${
    mEnterlobiiFall2023Present ? "" : "not"
  } present in Fall 2023, and\n  
  ${mIncognitaSpring2024} M. incognita present per 500cc 
  and M. enterlobii ${
    mEnterlobiiSpring2024Present ? "" : "not"
  } present in Spring 2024.\n
  Thus, with the cost of nematicides being $${costOfNematicides}, the cost of sweetpotatoes being $${otherCostsForSweets} 
  and the cost of peanuts being $${costForPeanuts}, you will see a profit of $${profit2023} in 2023 and $${profit2024} in 2024
  for a total profit of $${totalProfit}.
  `;

  return (
    <ArcherContainer strokeColor="black">
    <div style={{ display: "flex", gap: 32, font: "14px sans-serif" }}>
      <div style={{ display: "flex" }}>
        <fieldset style={{ display: "grid", alignItems: "center" }}>
          <legend>Costs for field ($/acre)</legend>
          {[
            {
              title: "Cost of nematicides ($)",
              max: 250,
              currentValue: costOfNematicides,
              set: setCostOfNematicides,
            },
            {
              title: "Other costs for sweets ($)",
              min: 1800,
              max: 2200,
              currentValue: otherCostsForSweets,
              set: setOtherCostsForSweets,
            },
            {
              title: "Cost for peanuts ($)",
              min: 780,
              max: 1000,
              currentValue: costForPeanuts,
              set: setCostForPeanuts,
            },
          ].map((gauge) => (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <DraggableGauge
                min={gauge.min || 0}
                max={gauge.max}
                radius={300}
                title={gauge.title}
                currentValue={gauge.currentValue}
                setCurrentValue={gauge.set}
                reverseColorScheme
                stroke="black"
              />
            </div>
          ))}
        </fieldset>

        <div style={{ display: "grid" }}>
          <fieldset
            style={{
              display: "flex",
              height: "fit-content",
              justifyContent: "space-between",
            }}
          >
            <legend>Root knot nematodes in field fall 2022</legend>
            <div style={{ display: "grid", width: "fit-content" }}>
              <DraggableGauge
                min={0}
                max={150}
                radius={300}
                title={`M. incognita per 500cc`}
                currentValue={mIncognita2022}
                setCurrentValue={setMIncognita2022}
                reverseColorScheme
                stroke="black"
              />
            </div>
            <RadioButtonGroup
              title="M. enterlobii found"
              data={["Found", "Not Found"]}
              currentValue={mEnterlobii2022Found}
              setCurrentValue={setMEnterlobii2022Found}
            />
          </fieldset>

          <div style={{ display: "flex" }}>
            <fieldset style={{ width: "fit-content", height: "fit-content" }}>
              <legend>Spring 2023</legend>
              <RadioButtonGroup
                title="Crop to plant (assumes the alternate crop in 2024)"
                data={["Peanuts", "Sweetpotatoes"]}
                currentValue={spring2023Crop}
                setCurrentValue={setSpring2023Crop}
              />
              <RadioButtonGroup
                title="Fumigant Nematicide 2023"
                data={applyFumigantNematicideOptions}
                currentValue={spring2023FumigantNematicide}
                setCurrentValue={setSpring2023FumigantNematicide}
              />
              <RadioButtonGroup
                title="Non-Fumigant Nematicide 2023"
                data={applyNonFumigantNematicideOptions}
                currentValue={spring2023NonFumigantNematicide}
                setCurrentValue={setSpring2023NonFumigantNematicide}
              />
            </fieldset>

            <fieldset
              style={{
                width: "fit-content",
              }}
            >
              <legend>Spring 2024</legend>
              <RadioButtonGroup
                title="Fumigant Nematicide 2024"
                data={applyFumigantNematicideOptions}
                currentValue={spring2024FumigantNematicide}
                setCurrentValue={setSpring2024FumigantNematicide}
              />
              <RadioButtonGroup
                title="Non-Fumigant Nematicide 2024"
                data={applyNonFumigantNematicideOptions}
                currentValue={spring2024NonFumigantNematicide}
                setCurrentValue={setSpring2024NonFumigantNematicide}
              />
            </fieldset>
          </div>

          <fieldset
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <legend>Fumigant</legend>
            <div style={{ display: "grid", height: "fit-content" }}>
              <DraggableGauge
                min={0}
                max={102}
                radius={300}
                title={`Avg Soil Temp (°F)`}
                currentValue={soilTemp}
                setCurrentValue={setSoilTemp}
                d3ColorScheme={d3.interpolateHslLong("deepskyblue", "red")}
                stroke="black"
              />
            </div>

            <div>
              {[
                {
                  title: "Fumigant best practices",
                  currentValue: fumigantBestPractices,
                  set: setFumigantBestPractices,
                },
                {
                  title: "Non-fumigant best practices",
                  currentValue: nonFumigantBestPractices,
                  set: setNonFumigantBestPractices,
                },
              ].map((buttonGroup) => (
                <RadioButtonGroup
                  title={buttonGroup.title}
                  data={bestPracticesOptions}
                  currentValue={buttonGroup.currentValue}
                  setCurrentValue={buttonGroup.set}
                />
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          width: 800,
        }}
      >
        <div style={{ display: "flex" }}>
          <LineChart
            data={[
              {
                title: "Spring 2023",
                value: mIncognitaSpring2023,
              },
              {
                title: "Fall 2023",
                value: mIncognitaFall2023,
              },
              {
                title: "Spring 2024",
                value: mIncognitaSpring2024,
              },
            ]}
            height={200}
            stepHeight={50}
            yAxisTitle="M. incognita per 500cc"
          />
        </div>

        <div style={{ display: "flex" }}>
          <fieldset style={{ display: "grid" }}>
            <legend>Profits from this field 2023 and 2024 ($/acre)</legend>
            {[
              { title: "2023 Profits", currentValue: profit2023 },
              { title: "2024 Profits", currentValue: profit2024 },
            ].map((gauge) => (
              <Gauge
                min={0}
                max={3200}
                radius={300}
                title={gauge.title}
                currentValue={gauge.currentValue}
              />
            ))}
          </fieldset>

          <ArcherElement id="profit">
          <fieldset>
            <legend>Total 2023 + 2024 profit from field ($/acre)</legend>
            <Gauge
              title="Total Revenue"
              min={0}
              max={8000}
              currentValue={totalValue}
              radius={300}
            />
            <ComponentGauge
              title="Revenue Cost Split"
              total={{
                title: "Total Revenue",
                value: totalValue,
                color: "mediumturquoise",
              }}
              components={[
                {
                  title: "Total Profit",
                  value: totalProfit,
                  color: "green",
                },
                { title: "Total Cost", value: totalCost, color: "crimson" },
              ]}
              max={8000}
              height={300}
            />
          </fieldset>
          </ArcherElement>
        </div>
        <div>{explanation}</div>
      </div>
      
    </div>
    </ArcherContainer>
  );
}

export default App;
