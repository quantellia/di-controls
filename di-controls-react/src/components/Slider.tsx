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

function Slider({
  title,
  styling = "styled-slider",
  min,
  max,
  step,
  currentValue,
  setCurrentValue,
}: SliderProps) {
  return (
    <>
      {title}
      <br />
      {currentValue}
      <br />
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

export default Slider;
