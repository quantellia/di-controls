import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";

interface d3Interpolate {
  (t: number): string;
}

interface GaugeProps {
  title: string;
  radius?: number;
  min: number;
  max: number;
  currentValue: number;
  d3ColorScheme?: d3Interpolate;
  reverseColorScheme?: boolean;
}

interface DraggableAreaChartProps {
  data: Array<{
    xValue?: number;
    title?: string;
    value: number;
  }>;
  yAxisTitle?: string;
  width?: number;
  height?: number;
  stepHeight?: number;
  isAreaChart?: boolean;
  color?: string;
  areaColor?: string;
  textColor?: string;
  stroke?: string;
}

interface ComponentGaugeProps {
  total: number;
  components: { title: string; value: number; color?: string }[];
  title: string;
  radius?: number;
  min: number;
  max: number;
  d3ColorScheme?: d3Interpolate;
}

/**
 *
 * @param {number} currentValue stateful value with the number to represent in the gauge
 * @param {string} title text under the currentValue
 * @param {number} min minimum number on the gauge
 * @param {number} max maximum number on the gauge
 * @param {number} radius OPTIONAL, radius of the gauge, default 500
 * @param {string} d3ColorScheme OPTIONAL, d3.Interpolate function to generate a color scheme, default d3.interpolateHslLong("red", "limegreen")
 * @param {boolean} reverseColorScheme OPTIONAL, whether or not to invert the direction the colorscheme flows in, default false
 */
function Gauge({
  currentValue,
  title,
  min,
  max,
  radius = 500,
  d3ColorScheme = d3.interpolateHslLong("red", "limegreen"),
  reverseColorScheme = false,
}: GaugeProps) {
  const gaugeRef = useRef(null);
  const width = radius;
  const height = radius / 2;
  const innerRadius = Math.min(width, height) / 1.8;
  const outerRadius = Math.min(width, height);
  const startAngle = -Math.PI / 2;
  const endAngle = Math.PI / 2;
  const currentAngle =
    Math.min((currentValue - min) / (max - min), max) * Math.PI;
  const smallFont = `font: ${Math.max(radius / 30, 8)}px sans-serif;`;
  const data = [...Array(max - min).keys()];
  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.toString()))
    .range(d3.quantize((t) => d3ColorScheme(t - 0.1), data.length));

  useEffect(() => {
    const svg = d3
      .select(gaugeRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-(width * 1.1) / 2, -height, width * 1.1, height * 1.1])
      .attr(
        "style",
        `max-width: 100%; height: auto; font: ${Math.max(
          radius / 15,
          20
        )}px sans-serif;`
      );
    svg.selectAll("g").remove();
    const g = svg.append("g");
    // .attr("transform", "translate(" + width / 2 + "," + height + ")");
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle);

    const foregroundArc = d3
      .arc()
      .innerRadius(Math.min(width, height) / 1.8)
      .outerRadius(Math.min(width, height))
      .startAngle(startAngle)
      .endAngle(startAngle + currentAngle);

    g.append("path").style("fill", "#ddd").attr("d", arc);
    g.append("path")
      .style(
        "fill",
        color(
          (reverseColorScheme
            ? max - currentValue - 1
            : currentValue - min - 1
          ).toString()
        ) as string
      )
      .attr("d", foregroundArc);

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

/**
 *
 * @param {{value: number, xValue: number, set: React.Dispatch<React.SetStateAction<number>>}}data  Array of objects of type {value, xValue, name} where value and set are stateful values
 * @param {number} width OPTIONAL, width of the linechart component, default 500
 * @param {number} height OPTIONAL, height of the line chart component, default 500
 * @param {boolean} isAreaChart OPTIONAL, whether or not to color the area under the line, default false
 * @param {string} color OPTIONAL, color of the line, default "#69b3a2"
 * @param {string} areaColor OPTIONAL, color of the area under the line if isAreaChart=true, default "rgba(105, 179, 162, 0.3)"
 * @param {string} textColor OPTIONAL, color of the text, default "rgba(105, 179, 162, 0.3)"
 * @param {string} stroke OPTIONAL, color of the stroke around handles, default "white"
 * @param {string} yAxisTitle OPTIONAL, text to label the y axis. default ""
 * @param {number} stepHeight OPTIONAL, readjusts the scale each time a point goes above or below a multiple of this number
 */
function LineChart({
  data,
  yAxisTitle = "",
  width = 500,
  height = 500,
  stepHeight = 1,
  isAreaChart = false,
  color = "#69b3a2",
  areaColor = "rgba(105, 179, 162, 0.3)",
  textColor = "black",
  stroke = "white",
}: DraggableAreaChartProps) {
  const graphRef = useRef(null);
  const graphValues = data.map((point, index) => ({
    x: point.xValue || index,
    title: point.title || "",
    y: point.value,
  }));

  const [, yMax] = d3.extent(data, (d) => d.value);
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([
        0,
        (yMax || 1) > stepHeight
          ? stepHeight * Math.ceil((yMax || 1) / stepHeight)
          : stepHeight,
      ])
      .range([height - 20, 10]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, height]);

  const xScale = useMemo(() => {
    return d3
      .scalePoint()
      .domain(data.map((point) => point.title || ""))
      .range([40, width - 40]);
  }, [data, width]);

  useEffect(() => {
    const svg = d3.select(graphRef.current);
    svg.selectAll("*").remove();
    const xAxisGenerator = d3.axisBottom(xScale);
    svg
      .append("g")
      .call(xAxisGenerator)
      .attr("transform", "translate(0," + (height - 20) + ")")
      .attr("color", textColor);

    const yAxisGenerator = d3.axisLeft(yScale);
    svg
      .append("g")
      .call(yAxisGenerator)
      .attr("transform", "translate(" + 40 + ",0)")
      .attr("color", textColor);

    // Add the area
    if (isAreaChart) {
      svg
        .append("path")
        .datum(graphValues)
        .attr("fill", areaColor)
        .attr("stroke", "none")
        .attr(
          "d",
          //@ts-expect-error jank typing built into d3
          d3
            .area()
            //@ts-expect-error jank typing built into d3
            .x((d) => xScale(d.x))
            .y0(height - 20)
            //@ts-expect-error jank typing built into d3
            .y1((d) => yScale(d.y))
        );
    }

    // Add the line
    svg
      .append("path")
      .datum(graphValues)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 4)
      .attr(
        "d",
        //@ts-expect-error jank typing built into d3
        d3
          .line()
          //@ts-expect-error jank typing built into d3
          .x((d) => xScale(d.title))
          //@ts-expect-error jank typing built into d3
          .y((d) => yScale(d.y))
      );

    graphValues.forEach((point) => {
      svg
        .append("circle")
        .attr("fill", color)
        .attr("stroke", stroke)
        .attr("cx", () => xScale(point.title) || 0)
        .attr("cy", () => yScale(point.y))
        .attr("r", 6);
    });

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - height / 2)
      .attr("dy", ".8em")
      .attr("style", "font: 10px sans-serif")
      .style("text-anchor", "middle")
      .text(yAxisTitle);
  });

  return <svg width={width} height={height} ref={graphRef} />;
}

/**
 *
 * @param {number} total the total value of all components
 * @param {{title: string, value: number, color: string}[]} components an array of objects of type {title: string, value: number, color?: string} that represent each component for the gauge
 * @param {number} max the maximum value that the total represents a fraction of
 * @param {number} width OPTIONAL, the width of the component gauge, default 300
 * @param {number} height OPTIONAL, the height of the component gauge, default 500
 * @param {d3Interpolate} d3ColorScheme OPTIONAL, the colorscheme for the component gauge to use, default d3.interpolateCool
 * @returns
 */
function ComponentGauge({
  total,
  components,
  title,
  min,
  max,
  radius = 300,
  d3ColorScheme = d3.interpolateHslLong("red", "limegreen"),
}: ComponentGaugeProps) {
  const gaugeRef = useRef(null);
  const width = radius;
  const height = radius / 2;
  const innerRadius = Math.min(width, height) / 1.8;
  const outerRadius = Math.min(width, height);
  const startAngle = -Math.PI / 2;
  const endAngle = Math.PI / 2;
  const smallFont = `font: ${Math.max(radius / 30, 8)}px sans-serif;`;
  const color = d3
    .scaleOrdinal()
    .domain(components.map((d) => d.title))
    .range(d3.quantize((t) => d3ColorScheme(t), components.length));

  useEffect(() => {
    const svg = d3
      .select(gaugeRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-(width * 1.1) / 2, -height, width * 1.1, height * 1.1])
      .attr(
        "style",
        `max-width: 100%; height: auto; font: ${Math.max(
          radius / 15,
          20
        )}px sans-serif;`
      );
    svg.selectAll("g").remove();
    const g = svg.append("g");
    // .attr("transform", "translate(" + width / 2 + "," + height + ")");
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle);

    g.append("path").style("fill", "#ddd").attr("d", arc);

    let componentStartAngle = startAngle;
    components.forEach((component) => {
      const currentAngle =
        Math.min((component.value - min) / (max - min), max) * Math.PI;
      const foregroundArc = d3
        .arc()
        .innerRadius(Math.min(width, height) / 1.8)
        .outerRadius(Math.min(width, height))
        .startAngle(componentStartAngle)
        .endAngle(componentStartAngle + currentAngle);
      const innerArc = d3
        .arc()
        .innerRadius(
          Math.min(width, height) / 1.8 -
            Math.max(
              (3 * component.title.length * Math.max(radius / 30, 8)) / 10
            )
        )
        .outerRadius(Math.min(width, height) / 1.8 - 18)
        .startAngle(componentStartAngle)
        .endAngle(componentStartAngle + currentAngle);

      g.append("path")
        .style(
          "fill",
          component.color ? component.color : (color(component.title) as string)
        )
        .attr("d", foregroundArc);
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
              .text(component.value) // set the actual text to the name in the data from our data object
        );
      if (currentAngle > 0.369)
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", (d) => `translate(${foregroundArc.centroid(d)})`)
          .call(
            (text) =>
              text
                .append("tspan")
                .attr("y", "-0.6em")
                .attr("font-weight", "bold")
                .attr("style", smallFont)
                .text(component.title) // set the actual text to the name in the data from our data object
          );
      else
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", (d) => `translate(${innerArc.centroid(d)})`)
          .call(
            (text) =>
              text
                .append("tspan")
                .attr("y", "+0.4em")
                .attr("font-weight", "bold")
                .attr("style", smallFont)
                .text(component.title) // set the actual text to the name in the data from our data object
          );
      componentStartAngle += currentAngle;
    });

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -(radius / 25))
      .text(total);
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

export { Gauge, LineChart, ComponentGauge };
