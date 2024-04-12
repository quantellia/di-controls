import "../index.css";

interface SliderProps {
  title: string;
  min: number;
  max: number;
  step: number;
  currentValue: number;
  setCurrentValue: React.Dispatch<React.SetStateAction<number>>;
}

function Slider({
  title,
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
        className="slider"
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
