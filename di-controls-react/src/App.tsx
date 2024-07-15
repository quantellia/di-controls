import { useState } from "react";
import { Gauge } from "./components/DataVisualizations";
import { RadioButtonGroup, Slider } from "./components/BasicControls";

function App() {
  const [spring2023Crop, setSpring2023Crop] = useState("Peanuts");
  const [spring2023FumigantNematicide, setSpring2023FumigantNematicide] =
    useState("Apply fumigant nematicide");
  const [spring2023NonFumigantNematicide, setSpring2023NonFumigantNematicide] =
    useState("Do not apply non-fumigant nematicide");
  const [spring2024FumigantNematicide, setSpring2024FumigantNematicide] =
    useState("Apply fumigant nematicide");
  const [spring2024NonFumigantNematicide, setSpring2024NonFumigantNematicide] =
    useState("Do not apply non-fumigant nematicide");

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

  const [mIncognitaSpring2023, setMIncognitaSpring2023] =
    useState(mIncognita2022);
  const [mEnterlobiiSpring2023Present, setMEnterlobiiSpring2023Present] =
    useState(true);

  const [mIncognitaFall2023, setMIncognitaFall2023] = useState(mIncognita2022);
  const [mEnterlobiiFall2023Present, setMEnterlobiiFall2023Present] =
    useState(true);

  const [mIncognitaSpring2024, setMIncognitaSpring2024] =
    useState(mIncognita2022);
  const [mEnterlobiiSpring2024Present, setMEnterlobiiSpring2024Present] =
    useState(true);

  const [profit2023, setProfit2023] = useState(410);
  const [profit2024, setProfit2024] = useState(290);
  const [totalProfit, setTotalProfit] = useState(profit2023 + profit2024);

  return (
    <div style={{ display: "flex", gap: 32 }}>
      <div>
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
            data={[
              "Apply fumigant nematicide",
              "Do not apply non-fumigant nematicide",
            ]}
            currentValue={spring2023FumigantNematicide}
            setCurrentValue={setSpring2023FumigantNematicide}
          />
          <RadioButtonGroup
            title="Non-Fumigant Nematicide 2023"
            data={[
              "Apply fumigant nematicide",
              "Do not apply non-fumigant nematicide",
            ]}
            currentValue={spring2023NonFumigantNematicide}
            setCurrentValue={setSpring2023NonFumigantNematicide}
          />
        </fieldset>
        <fieldset>
          <legend>Spring 2024</legend>
          <RadioButtonGroup
            title="Fumigant Nematicide 2024"
            data={[
              "Apply fumigant nematicide",
              "Do not apply non-fumigant nematicide",
            ]}
            currentValue={spring2024FumigantNematicide}
            setCurrentValue={setSpring2024FumigantNematicide}
          />
          <RadioButtonGroup
            title="Non-Fumigant Nematicide 2024"
            data={[
              "Apply fumigant nematicide",
              "Do not apply non-fumigant nematicide",
            ]}
            currentValue={spring2024NonFumigantNematicide}
            setCurrentValue={setSpring2024NonFumigantNematicide}
          />
        </fieldset>
      </div>

      <fieldset style={{ height: "fit-content", display: "grid" }}>
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
            title: "Cost of nematicides ($)",
            min: 780,
            max: 1000,
            currentValue: costForPeanuts,
            set: setCostForPeanuts,
          },
        ].map((gauge) => (
          <>
            <Gauge
              min={gauge.min || 0}
              max={gauge.max}
              radius={300}
              title={gauge.title}
              currentValue={gauge.currentValue}
            />
            <Slider
              min={gauge.min || 0}
              max={gauge.max}
              step={1}
              currentValue={gauge.currentValue}
              setCurrentValue={gauge.set}
            />
          </>
        ))}
      </fieldset>

      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ display: "flex" }}>
          <fieldset
            style={{
              height: "fit-content",
              width: "fit-content",
            }}
          >
            <legend>Root knot nematodes in field fall 2022</legend>
            <RadioButtonGroup
              title="M. incognita found"
              data={["Found", "Not Found"]}
              currentValue={mEnterlobii2022Found}
              setCurrentValue={setMEnterlobii2022Found}
            />
            <div style={{ display: "grid", width: "fit-content" }}>
              <Gauge
                min={0}
                max={150}
                radius={300}
                title={`M. incognita per 500cc`}
                currentValue={mIncognita2022}
              />
              <Slider
                min={0}
                max={150}
                step={1}
                currentValue={mIncognita2022}
                setCurrentValue={setMIncognita2022}
              />
            </div>
          </fieldset>
          <fieldset style={{ display: "flex" }}>
            <legend>Fumigant</legend>
            <div style={{ display: "grid", height: "fit-content" }}>
              <Gauge
                min={0}
                max={102}
                radius={300}
                title={`Avg Soil Temp (°F)`}
                currentValue={soilTemp}
              />
              <Slider
                min={0}
                max={102}
                step={1}
                currentValue={soilTemp}
                setCurrentValue={setSoilTemp}
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
        <div style={{ display: "flex" }}>
          {[
            {
              title: "Spring 2023",
              currentValue: mIncognitaSpring2023,
              present: mEnterlobiiSpring2023Present,
            },
            {
              title: "Fall 2023",
              currentValue: mIncognitaFall2023,
              present: mEnterlobiiFall2023Present,
            },
            {
              title: "Spring 2024",
              currentValue: mIncognitaSpring2024,
              present: mEnterlobiiSpring2024Present,
            },
          ].map((gauge) => (
            <fieldset style={{ height: "fit-content" }}>
              <legend>{gauge.title}</legend>
              <Gauge
                min={0}
                max={150}
                radius={300}
                title={`M. incognita per 500cc`}
                currentValue={gauge.currentValue}
              />
              <p>{`M. enterlobii ${
                gauge.present ? "present" : "not present"
              }`}</p>
            </fieldset>
          ))}
          <div>
            <fieldset>
              <legend>Profits from this field 2023 and 2024 ($/acre)</legend>
              {[
                { title: "2023 Profits", currentValue: profit2023 },
                { title: "2024 Profits", currentValue: profit2024 },
              ].map((gauge) => (
                <Gauge
                  min={0}
                  max={3000}
                  radius={300}
                  title={gauge.title}
                  currentValue={gauge.currentValue}
                />
              ))}
            </fieldset>
            <fieldset>
              <legend>Total 2023 + 2024 profit from field ($/acre)</legend>
              <Gauge
                min={0}
                max={3000}
                radius={300}
                title={"Total Profit"}
                currentValue={totalProfit}
              />
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
