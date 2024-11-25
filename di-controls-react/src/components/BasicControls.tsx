import "../index.css";

interface SliderProps {
  title?: string;
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

interface CheckBoxGroupProps {
  title: string;
  vertical?: boolean;
  currentValue: { name: string; checked: boolean }[] | undefined;
  setCurrentValue: (value: { name: string; checked: boolean }[]) => void;
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
      {title && (
        <p
          style={{ font: "12px sans-serif", margin: "4px" }}
        >{`${title}: ${currentValue}`}</p>
      )}
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
    <fieldset
      style={{
        display: vertical ? "block" : "flex",
        height: "fit-content",
        width: "fit-content",
      }}
    >
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
              readOnly
            />
            <label htmlFor={value}>{value}</label>
          </div>
        </>
      ))}
    </fieldset>
  );
}

function CheckBoxGroup({
  title,
  vertical = true,
  currentValue,
  setCurrentValue,
}: CheckBoxGroupProps) {
  return (
    <fieldset
      style={{
        display: vertical ? "block" : "flex",
        height: "fit-content",
        width: "fit-content",
      }}
    >
      <legend>{title}</legend>
      {currentValue?.map((checkbox, index) => (
        <>
          <div>
            <input
              type="checkbox"
              id={checkbox.name}
              name={title}
              value={checkbox.name}
              onClick={() => {
                const newArray = currentValue;
                newArray[index] = { ...checkbox, checked: !checkbox.checked };
                setCurrentValue([...newArray]);
              }}
              checked={checkbox.checked}
              readOnly
              key={`${title}-${checkbox.name}`}
            />
            <label htmlFor={checkbox.name}>{checkbox.name}</label>
          </div>
        </>
      ))}
    </fieldset>
  );
}

export { Slider, RadioButtonGroup, CheckBoxGroup };
