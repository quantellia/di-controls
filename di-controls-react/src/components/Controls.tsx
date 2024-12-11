import Color from "color";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface d3Interpolate {
  (t: number): string;
}

interface DraggableGaugeProps {
  title: string;
  radius?: number;
  min: number;
  max: number;
  currentValue: number;
  setCurrentValue: React.Dispatch<React.SetStateAction<number>>;
  d3ColorScheme?: d3Interpolate;
  reverseColorScheme?: boolean;
  stroke?: string;
}

interface DialProps {
  title: string;
  radius?: number;
  values: number[] | string[];
  currentValue: number | string;
  setCurrentValue: (newValue: number | string) => void;
  d3ColorScheme?: d3Interpolate;
  reverseColorScheme?: boolean;
  stroke?: string;
}

const colorLuminosityThreshold = 0.2;

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

function DraggableGauge({
  currentValue,
  setCurrentValue,
  title,
  min,
  max,
  radius = 500,
  d3ColorScheme = d3.interpolateHslLong("red", "limegreen"),
  reverseColorScheme = false,
  stroke = "white",
}: DraggableGaugeProps) {
  const gaugeRef = useRef("graph"); // create the persistent ref object to store the SVG in

  // dimensional values
  const width = radius;
  const height = radius / 2;
  const innerRadius = Math.min(width, height) / 1.8;
  const outerRadius = Math.min(width, height);

  // start and end angles for the whole gauge
  const startAngle = -Math.PI / 2;
  const endAngle = Math.PI / 2;

  // current angle as a measure of progress between start and end angles
  const currentAngle =
    Math.min((currentValue - min) / (max - min), max) * Math.PI;

  // misc other variables
  const smallFont = `font: ${Math.max(radius / 30, 8)}px sans-serif;`;
  const data = [...Array(max - min).keys()];
  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.toString()))
    .range(d3.quantize((t) => d3ColorScheme(t - 0.1), data.length));

  useEffect(() => {
    // create the svg with the necessary dimensions and styling
    const svg = d3
      .select(gaugeRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [
        -(width * 1.1) / 2,
        -height - radius / 25,
        width * 1.1,
        height * 1.2,
      ])
      // text styling for fonts
      .attr(
        "style",
        `max-width: 100%; height: auto; font: ${Math.max(
          radius / 15,
          20
        )}px sans-serif;`
      );
    svg.selectAll("g").remove();
    const g = svg.append("g");

    // background grey arc
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle);

    // foregroundArc is the arc in the foreground, i.e. the arc that shows gauge value
    const foregroundArc = d3
      .arc()
      .innerRadius(Math.min(width, height) / 1.8)
      .outerRadius(Math.min(width, height))
      .startAngle(startAngle)
      .endAngle(startAngle + currentAngle);

    // these populate the svg with the arcs that we generated
    g.append("path").style("fill", "#ddd").attr("d", arc); // background arc filled grey

    // foreground arc
    g.append("path")
      .style(
        "fill",
        color(
          (reverseColorScheme // use defined colour schemes
            ? max - currentValue - 1
            : currentValue - min - 1
          ).toString()
        ) as string
      )
      .attr("d", foregroundArc);

    // delete any previously rendered handles
    svg.selectAll("circle").remove();

    // render the current handle
    svg
      .append("circle")
      .attr("cy", -outerRadius * Math.cos(startAngle + currentAngle))
      .attr("cx", outerRadius * Math.sin(startAngle + currentAngle))
      .attr("r", radius / 25)
      .attr(
        "fill",
        color(
          (reverseColorScheme
            ? max - currentValue - 1
            : currentValue - min - 1
          ).toString()
        ) as string
      )
      .attr("stroke", stroke)
      .call(
        (
          circle // onDrag function
        ) =>
          circle.call(
            // @ts-expect-error jank typing built into d3
            d3.drag().on("drag", (e) => {
              setCurrentValue(
                // clamp the currentValue between the min and max
                Math.min(
                  Math.max(
                    min +
                      Math.floor(((e.x + radius / 2) / radius) * (max - min)), // calculate the currentValue
                    min
                  ),
                  max
                )
              );
            })
          )
      );

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -(radius / 25))
      .text(currentValue);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("style", smallFont)
      .text(title);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("x", -(outerRadius + innerRadius) / 2)
      .attr("style", smallFont)
      .attr("y", Math.max(radius / 30, 8))
      .text(min);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("x", (outerRadius + innerRadius) / 2)
      .attr("y", Math.max(radius / 30, 8))
      .attr("style", smallFont)
      .text(max);
  });

  return <svg ref={gaugeRef} />;
}

function Dial({
  currentValue,
  setCurrentValue,
  title,
  values,
  radius = 500,
  d3ColorScheme = d3.interpolateHslLong("red", "limegreen"),
  reverseColorScheme = false,
  stroke = "white",
}: DialProps) {
  const gaugeRef = useRef("graph"); // create the persistent ref object to store the SVG in

  // dimensional values
  const width = radius;
  const height = radius / 2;
  const innerRadius = Math.min(width, height) / 1.8;
  const outerRadius = Math.min(width, height);

  // start and end angles for the whole gauge
  const startAngle = -Math.PI / 1.3;
  const endAngle = Math.PI / 1.3;
  const angleOffset = (1 / values.length) * (endAngle - startAngle);
  const currentAngle =
    startAngle +
    angleOffset * (values.indexOf(currentValue as never) + 1) -
    angleOffset / 2;

  // misc other variables
  const smallFont = `font: ${Math.max(radius / 30, 8)}px sans-serif;`;
  const color = d3
    .scaleOrdinal()
    .domain(values.map((d) => d.toString()))
    .range(d3.quantize((t) => d3ColorScheme(t), values.length));

  useEffect(() => {
    // create the svg with the necessary dimensions and styling
    const svg = d3
      .select(gaugeRef.current)
      .attr("width", width)
      .attr("height", height * 1.75)
      .attr("viewBox", [-(width * 1.1) / 2, -height / 1.6, width * 1.1, height])
      // text styling for fonts
      .attr(
        "style",
        `max-width: 100%; height: auto; font: ${Math.max(
          radius / 15,
          20
        )}px sans-serif;`
      );
    svg.selectAll("g").remove();
    const g = svg.append("g");

    // background grey arc
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle);

    // these populate the svg with the arcs that we generated
    g.append("path").style("fill", "#ddd").attr("d", arc); // background arc filled grey

    let currentStartAngle = startAngle;
    values.forEach((value, index) => {
      const title = value.toString();
      const currentEndAngle = currentStartAngle + angleOffset;
      const foregroundArc = d3
        .arc()
        .innerRadius(Math.min(width, height) / 1.8)
        .outerRadius(Math.min(width, height))
        .startAngle(currentStartAngle)
        .endAngle(currentEndAngle);

      const sectionColor = color(
        (reverseColorScheme ? values.length - index : index).toString()
      ) as string;
      g.append("path").style("fill", sectionColor).attr("d", foregroundArc);
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${foregroundArc.centroid(d)})`)
        .call(
          (text) =>
            text
              .append("tspan")
              .attr("y", "+0.4em")
              .attr("font-weight", "bold")
              .attr("style", smallFont)
              .attr("fill", () =>
                Color(sectionColor).luminosity() < colorLuminosityThreshold
                  ? "white"
                  : "black"
              )
              .text(title) // set the actual text to the name in the data from our data object
        );
      currentStartAngle += angleOffset;
    });

    // delete any previously rendered handles
    svg.selectAll("circle").remove();

    // render the current handle
    svg
      .append("circle")
      .attr("cy", -innerRadius * Math.cos(currentAngle))
      .attr("cx", innerRadius * Math.sin(currentAngle))
      .attr("r", radius / 25)
      .attr(
        "fill",
        color(
          (reverseColorScheme
            ? values.length - values.indexOf(currentValue as never)
            : values.indexOf(currentValue as never)
          ).toString()
        ) as string
      )
      .attr("stroke", stroke)
      .call(
        (
          circle // onDrag function
        ) =>
          circle.call(
            // @ts-expect-error jank typing built into d3
            d3.drag().on("drag", (e) => {
              const mouseAngle = Math.atan(e.x / e.y); // calculate the angle of the mouse's position

              // this block just converts our mouseAngle into a useable value from 0 to 2Pi since the default atan() acts on Pi / 2 instead
              let mouseAngle360 =
                mouseAngle > 0 ? Math.PI - mouseAngle : Math.abs(mouseAngle);
              mouseAngle360 =
                e.x < 0 ? -Math.PI + mouseAngle360 : mouseAngle360;
              setCurrentValue(
                values[
                  clamp(
                    Math.floor(mouseAngle360 / angleOffset) +
                      Math.ceil(values.length / 2),
                    0,
                    values.length - 1
                  )
                ]
              );
            })
          )
      );

    g.append("text").attr("text-anchor", "middle").text(currentValue);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("style", smallFont)
      .attr("y", radius / 20)
      .text(title);
  }, [
    angleOffset,
    color,
    currentAngle,
    currentValue,
    endAngle,
    height,
    innerRadius,
    outerRadius,
    radius,
    reverseColorScheme,
    setCurrentValue,
    smallFont,
    startAngle,
    stroke,
    title,
    values,
    width,
  ]);

  return <svg ref={gaugeRef} />;
}

export { Dial, DraggableGauge };
