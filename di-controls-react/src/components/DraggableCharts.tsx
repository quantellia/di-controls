import Color from "color";
import * as d3 from "d3";
import { RefObject, useEffect, useRef, useState } from "react";

interface d3Interpolate {
  (t: number): string;
}

interface DraggablePieChartProps {
  data: Array<{
    name: string;
    color?: string;
    value: number;
    set: React.Dispatch<React.SetStateAction<number>>;
  }>;
  radius?: number;
  isDonut?: boolean;
  d3ColorScheme?: d3Interpolate;
  textColor?: string;
  stroke?: string;
  onlyAdjustSubsequentSlices?: boolean;
  compensate?: boolean;
}

/**
 *
 * @param {Object} data Array of objects of type {name, color?, value, set} where 'value' and 'set' are derived from useState()
 * @param {number} [radius=500] OPTIONAL, radius in pixels of the piechart element, default 500
 * @param {boolean} [isDonut=false] OPTIONAL, whether or not the piechart is hollow, default false
 * @param {d3Interpolate} [d3ColorScheme=d3.interpolateSpectral] OPTIONAL, d3 interpolate function for easily generating color schemes, default d3.interpolateSpectral
 * @param {string=} textColor OPTIONAL, override for text color, default adjusts text color based on luminosity of each slice
 * @param {string=} stroke OPTIONAL, override for stroke color around elements, default white
 * @param {boolean} [onlyAdjustSubsequentSlices=false] OPTIONAL, override to only adjust slices ocurring 'after' the one being dragged, order starts from the top right element and then moves clockwise.  Can improve precision but causes all slices 'before' the one being edited to not readjust automatically, default false
 * @returns pain
 */
function DraggablePieChart({
  data,
  radius = 500,
  compensate = true,
  isDonut = false,
  d3ColorScheme = d3.interpolateSpectral,
  textColor,
  stroke,
  onlyAdjustSubsequentSlices = false,
}: DraggablePieChartProps) {
  const graphRef = useRef("graph");
  const [currentManipulatedIndex, setCurrentManipulatedIndex] = useState(0);
  const [currentTotal] = useState(
    data.reduce((accumulator, slice) => accumulator + slice.value, 0)
  );
  const total = compensate
    ? Math.round(
        data.reduce((accumulator, slice) => accumulator + slice.value, 0)
      )
    : 0;

  const width = radius;
  const height = radius;
  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.name))
    .range(
      d3.quantize((t) => d3ColorScheme(t * 0.8 + 0.1), data.length).reverse()
    );
  const colorLuminosityThreshold = 0.15;
  const arc = d3
    .arc()
    .innerRadius(isDonut ? Math.min(width, height) / 3.5 - 1 : radius / 25)
    .outerRadius(Math.min(width, height) / 2 - 1);
  const pie = d3
    .pie()
    .sort(null)
    //@ts-expect-error d.data is not a number, it's an object the same as "slice"
    .value((d) => d.value);

  //@ts-expect-error pie() accepts our data and molds further functions that use the data generated to the datatypes within data
  const arcs = pie(data);

  useEffect(() => {
    if (compensate) {
      const delta = total - currentTotal;
      const indexesToAdjust = onlyAdjustSubsequentSlices
        ? data.slice(currentManipulatedIndex + 1)
        : data;
      indexesToAdjust.forEach((slice) => {
        if (
          Math.floor(delta) !== 0 &&
          slice !== indexesToAdjust[currentManipulatedIndex]
        ) {
          const targetValue =
            Math.round((slice.value - delta / indexesToAdjust.length) * 100) /
            100;
          slice.set(targetValue > 0 ? targetValue : 0);
        }
      });
    }
    // @ts-expect-error 'd' doesn't need to be provided to outerRadius() in this context, blame the library
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
      .attr(
        "style",
        `max-width: 100%; height: auto; font: ${Math.max(
          radius / 40,
          12
        )}px sans-serif;`
      );

    svg.selectAll("g").remove();

    svg
      .append("g")
      .attr("stroke", stroke || "white")
      .selectAll()
      .data(arcs)
      .join("path")
      // @ts-expect-error d.data is not a number, it's an object the same as "slice"
      .attr("fill", (d) => d.data.color || (color(d.data.name) as string))
      // @ts-expect-error I don't even know why this works but that's untyped javascript for you
      .attr("d", arc)
      .append("title")
      //@ts-expect-error d.data is not a number, it's an object the same as "slice"
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString("en-US")}`);
    svg
      .append("g")
      .attr("text-anchor", "middle")
      .selectAll()
      .data(arcs)
      .join("text")
      // @ts-expect-error mfw d3's own types don't match with what it accepts
      .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
      .call((text) =>
        text
          .append("tspan")
          .attr("y", "-0.4em")
          .attr("font-weight", "bold")
          .attr(
            "fill",
            textColor ||
              ((d) =>
                Color(
                  // @ts-expect-error d.data is not a number, it's an object the same as "slice"
                  d.data.color || (color(d.data.name) as string)
                ).luminosity() < colorLuminosityThreshold
                  ? "white"
                  : "black")
          )
          //@ts-expect-error d.data is not a number, it's an object the same as "slice"
          .text((d) => d.data.name)
      )
      .call((text) =>
        text
          .filter((d) => d.endAngle - d.startAngle > 0.25)
          .append("tspan")
          .attr("x", 0)
          .attr("y", "0.7em")
          .attr("fill-opacity", 0.7)
          .attr(
            "fill",
            textColor ||
              ((d) =>
                Color(
                  // @ts-expect-error d.data is not a number, it's an object the same as "slice"
                  d.data.color || (color(d.data.name) as string)
                ).luminosity() < colorLuminosityThreshold
                  ? "white"
                  : "black")
          )
          //@ts-expect-error d.data is not a number, it's an object the same as "slice"
          .text((d) => d.data.value.toLocaleString("en-US"))
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    color,
    currentTotal,
    data,
    onlyAdjustSubsequentSlices,
    stroke,
    textColor,
    radius,
  ]);

  useEffect(() => {
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
      .attr(
        "style",
        `max-width: 100%; height: auto; font: ${Math.max(
          radius / 40,
          12
        )}px sans-serif;`
      );

    svg.selectAll("circle").remove();

    arcs.forEach((slice, index) => {
      svg
        .append("circle")
        .attr("cy", -(width / 2) * Math.cos(slice.endAngle))
        .attr("cx", (height / 2) * Math.sin(slice.endAngle))
        .attr("r", radius / 25)
        .attr("fill", data[index].color || (color(data[index].name) as string))
        .attr("stroke", stroke || "white")
        .call((circle) =>
          circle.call(
            // @ts-expect-error jank typing weirdness built into d3
            d3.drag().on("drag", (e) => {
              const mouseAngle = Math.atan(e.x / e.y);
              let mouseAngle360 =
                mouseAngle > 0 ? Math.PI - mouseAngle : Math.abs(mouseAngle);
              mouseAngle360 = e.x < 0 ? Math.PI + mouseAngle360 : mouseAngle360;
              mouseAngle360 =
                mouseAngle360 < arcs[index].startAngle &&
                !onlyAdjustSubsequentSlices
                  ? 2 * Math.PI + mouseAngle360
                  : mouseAngle360;

              const sliceStartValue = data
                .slice(0, index)
                .reduce((accumulator, slice) => accumulator + slice.value, 0);
              const sliceEndValue = total * (mouseAngle360 / (2 * Math.PI));
              const valueToSet =
                Math.round((sliceEndValue - sliceStartValue) * 100) / 100;

              setCurrentManipulatedIndex(index);
              data[index].set(valueToSet > 0 ? valueToSet : 0);
            })
          )
        );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, data, onlyAdjustSubsequentSlices, radius, stroke]);

  return (
    <>
      <svg ref={graphRef as unknown as RefObject<SVGSVGElement>}></svg>
    </>
  );
}

export { DraggablePieChart };
