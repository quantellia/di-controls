import * as d3 from "d3";
import { useEffect, useRef } from "react";

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

export { Gauge };
