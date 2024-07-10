import "../index.css";

interface SliderProps {
  title: string;
  styling?: string;
  min: number;
  max: number;
  step: number;
  currentValue: number;
  setCurrentValue: React.Dispatch<React.SetStateAction<number>>;
}

interface RadioButtonGroupProps {
  title: string;
  data: string[];
  vertical?: boolean;
  currentValue: string | undefined;
  setCurrentValue: (value: string) => void;
}

function Slider({
  title,
  styling = "slider",
  min,
  max,
  step,
  currentValue,
  setCurrentValue,
}: SliderProps) {
  return (
    <>
      <p
        style={{ font: "12px sans-serif", margin: "4px" }}
      >{`${title}: ${currentValue}`}</p>
      <input
        className={styling}
        type="range"
        min={min.toString()}
        max={max.toString()}
        step={step.toString()}
        value={currentValue.toString()}
        onChange={(event) => {
          setCurrentValue(parseInt(event.target.value));
        }}
      />
      <br />
    </>
  );
}

function RadioButtonGroup({
  title,
  data,
  vertical = true,
  currentValue,
  setCurrentValue,
}: RadioButtonGroupProps) {
  return (
    <fieldset style={{ display: vertical ? "block" : "flex" }}>
      <legend>{title}</legend>
      {data.map((value) => (
        <>
          <div>
            <input
              type="radio"
              id={value}
              name={title}
              value={value}
              onClick={() => {
                setCurrentValue(value);
              }}
              checked={currentValue === value}
            />
            <label htmlFor={value}>{value}</label>
          </div>
        </>
      ))}
    </fieldset>
  );
}

export { Slider, RadioButtonGroup };
