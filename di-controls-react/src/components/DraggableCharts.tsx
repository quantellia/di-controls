import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface DraggablePieChartProps {
  data: Array<{
    name: string;
    value: number;
    set: React.Dispatch<React.SetStateAction<number>>;
  }>;
  compensate?: boolean;
}

function DraggablePieChart({ data, compensate }: DraggablePieChartProps) {
  const ref = useRef("default");
  const [currentTotal] = useState(
    data.reduce((accumulator, slice) => accumulator + slice.value, 0)
  );
  const total = compensate
    ? data.reduce((accumulator, slice) => accumulator + slice.value, 0)
    : 0;

  useEffect(() => {
    if (compensate) {
      const delta = total - currentTotal;
      data.forEach((slice) => {
        slice.set(Math.floor(slice.value - delta / data.length));
      });
    }

    const width = 500;
    const height = Math.min(width, 500);
    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range(
        d3
          .quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
          .reverse()
      );
    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d.value);
    const arc = d3
      .arc()
      .innerRadius(Math.min(width, height) / 3.5 - 1)
      .outerRadius(Math.min(width, height) / 2 - 1);
    const labelRadius = arc.outerRadius()() * 0.8;
    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
    const arcs = pie(data);

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
    svg
      .append("g")
      .attr("stroke", "white")
      .selectAll()
      .data(arcs)
      .join("path")
      .attr("fill", (d) => color(d.data.name))
      .attr("d", arc)
      .append("title")
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString("en-US")}`);
    svg
      .append("g")
      .attr("text-anchor", "middle")
      .selectAll()
      .data(arcs)
      .join("text")
      .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
      .call((text) =>
        text
          .append("tspan")
          .attr("y", "-0.4em")
          .attr("font-weight", "bold")
          .text((d) => d.data.name)
      )
      .call((text) =>
        text
          .filter((d) => d.endAngle - d.startAngle > 0.25)
          .append("tspan")
          .attr("x", 0)
          .attr("y", "0.7em")
          .attr("fill-opacity", 0.7)
          .text((d) => d.data.value.toLocaleString("en-US"))
      );
    console.log(total);
  }, [data]);
  return <svg ref={ref}></svg>;
}

export default DraggablePieChart;
