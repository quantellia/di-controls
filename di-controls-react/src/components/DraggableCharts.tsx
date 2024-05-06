import * as d3 from "d3";
import { MutableRefObject, useEffect, useRef, useState } from "react";

interface DraggablePieChartProps {
  data: Array<{
    name: string;
    value: number;
    set: React.Dispatch<React.SetStateAction<number>>;
  }>;
  compensate?: boolean;
}

function DraggablePieChart({ data, compensate }: DraggablePieChartProps) {
  const graphRef: MutableRefObject<string> = useRef();
  const handlesRef: MutableRefObject<string> = useRef();
  const [currentManipulatedIndex, setCurrentManipulatedIndex] = useState(0);
  const [currentTotal] = useState(
    data.reduce((accumulator, slice) => accumulator + slice.value, 0)
  );
  const total = compensate
    ? Math.round(
        data.reduce((accumulator, slice) => accumulator + slice.value, 0)
      )
    : 0;

  const width = 500;
  const height = width;
  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.name))
    .range(
      d3
        .quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
        .reverse()
    );
  const arc = d3
    .arc()
    .innerRadius(Math.min(width, height) / 3.5 - 1)
    .outerRadius(Math.min(width, height) / 2 - 1);
  const pie = d3
    .pie()
    .sort(null)
    .value((d) => d.value);

  const arcs = pie(data);

  useEffect(() => {
    if (compensate) {
      const delta = total - currentTotal;
      const indexesToAdjust = data.slice(currentManipulatedIndex + 1);
      indexesToAdjust.forEach((slice) => {
        if (delta !== 0)
          slice.set(
            Math.round((slice.value - delta / indexesToAdjust.length) * 100) /
              100
          );
      });
    }
    const labelRadius = arc.outerRadius()() * 0.8;
    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

    const svg = d3
      .select(graphRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [
        -(width * 1.1) / 2,
        -(height * 1.1) / 2,
        width * 1.1,
        height * 1.1,
      ])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    svg.selectAll("g").remove();

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
  }, [
    arc,
    arcs,
    color,
    compensate,
    currentTotal,
    data,
    height,
    total,
    currentManipulatedIndex,
  ]);

  useEffect(() => {
    const svg = d3
      .select(handlesRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [
        -(width * 1.1) / 2,
        -(height * 1.1) / 2,
        width * 1.1,
        height * 1.1,
      ])
      .attr(
        "style",
        `max-width: 100%; height: auto; font: 10px sans-serif; position: relative; left: -${width}px`
      );

    svg.selectAll("circle").remove();

    arcs.forEach((slice, index) => {
      svg
        .append("circle")
        .attr("cy", -(width / 2) * Math.cos(slice.endAngle))
        .attr("cx", (height / 2) * Math.sin(slice.endAngle))
        .attr("r", 20)
        .attr("fill", color(data[index].name))
        .attr("stroke", "white")
        .call((circle) =>
          circle.call(
            // @ts-expect-error jank typing weirdness built into d3
            d3.drag().on("drag", (e) => {
              const mouseAngle = Math.atan(e.x / e.y);
              let mouseAngle360 =
                mouseAngle > 0 ? Math.PI - mouseAngle : Math.abs(mouseAngle);
              mouseAngle360 = e.x < 0 ? Math.PI + mouseAngle360 : mouseAngle360;

              const sliceStartValue = data
                .slice(0, index)
                .reduce((accumulator, slice) => accumulator + slice.value, 0);
              const sliceEndValue = total * (mouseAngle360 / (2 * Math.PI));

              setCurrentManipulatedIndex(index);
              data[index].set(Math.floor(sliceEndValue - sliceStartValue));
            })
          )
        );
    });
  }, [arcs, data]);
  return (
    <>
      <svg ref={graphRef}></svg>
      <svg ref={handlesRef}></svg>
    </>
  );
}

export default DraggablePieChart;
