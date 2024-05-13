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
  isDonut = false,
  d3ColorScheme = d3.interpolateSpectral,
  textColor,
  stroke,
  onlyAdjustSubsequentSlices = false,
}: DraggablePieChartProps) {
  const graphRef = useRef("graph"); // creates the perisistent ref object we use for rendering the graph at the end
  const [currentManipulatedIndex, setCurrentManipulatedIndex] = useState(0); // create a stateful value for the handle we're manipulating
  const [currentTotal] = useState(
    data.reduce((accumulator, slice) => accumulator + slice.value, 0) // create a stateful value for the current total of all of the slices
  );
  const total = Math.round(
    data.reduce((accumulator, slice) => accumulator + slice.value, 0) // create a static value for the normal total of all the slices
  );

  const width = radius;
  const height = radius;

  // create a colour scheme using either what was passed or the default interpolateSpectral() colour scheme
  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.name))
    .range(
      d3.quantize((t) => d3ColorScheme(t * 0.8 + 0.1), data.length).reverse()
    );
  const colorLuminosityThreshold = 0.15;

  // create a default arc structure that each of our slices will use to generate themselves
  const arc = d3
    .arc()
    .innerRadius(isDonut ? Math.min(width, height) / 3.5 - 1 : radius / 25) // if we want a donut chart, significantly increases the hole in the middle
    .outerRadius(Math.min(width, height) / 2 - 1);

  // this and arcs create a piechart from our data
  const pie = d3
    .pie()
    .sort(null)
    //@ts-expect-error d.data is not a number, it's an object the same as "slice"
    .value((d) => d.value);

  //@ts-expect-error pie() accepts our data and molds further functions that use the data generated to the datatypes within data
  const arcs = pie(data);

  // this useEffect() is here as we want to re-render our piechart whenever any of the variables that it builds itself from change
  // these variables are contained in the dependency array at the bottom of the function
  useEffect(() => {
    // when the chart updates, we need to adjust other slices from the one that we affected, this is where we do that
    const delta = total - currentTotal; // get the difference between all the current values and what they should be
    const indexesToAdjust = onlyAdjustSubsequentSlices // get the indexes of the data array that we want to adjust
      ? data.slice(currentManipulatedIndex + 1)
      : data;

    // for each slice in the indexesToAdjust array, we want to evenly increase / decrease them to keep their relative ratios to eachother
    indexesToAdjust.forEach((slice) => {
      if (
        Math.floor(delta) !== 0 &&
        slice !== indexesToAdjust[currentManipulatedIndex]
      ) {
        const targetValue =
          Math.round((slice.value - delta / indexesToAdjust.length) * 100) /
          100;
        slice.set(targetValue > 0 ? targetValue : 0); // if a slice would be adjusted below 0, we just set it to 0
      }
    });

    // @ts-expect-error 'd' doesn't need to be provided to outerRadius() in this context, blame the library
    const labelRadius = arc.outerRadius()() * 0.8; // radius that the labels should appear in within the chart
    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius); // creates an arc object that our labels will use to position themselves

    // create the actual piechart svg, note that this svg does not contain the handles, only the chart, and is therefore non-interactable
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

      // this attr defines the styling we use for the chart, i.e. size, text params, etc.
      .attr(
        "style",
        `max-width: 100%; height: auto; font: ${Math.max(
          radius / 40,
          12
        )}px sans-serif;`
      );

    svg.selectAll("g").remove(); // remove all previously generated ui elements, this helps with performance and looks

    // here, we append all the newly calcluated slices from whatever new data is coming in
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

    // this is where all the labels are added to the piechart
    svg
      .append("g")
      .attr("text-anchor", "middle")
      .selectAll()
      .data(arcs)
      .join("text")
      // @ts-expect-error mfw d3's own types don't match with what it accepts
      .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)

      // the text param we are calling here refers to each of the "text" attrs that we joined to the svg earlier in the chain
      // acts kind of like a "foreach" as it will go through each text object and depending on the values will update it differently with the logic inside

      // inside this particular block, we are setting the name of the slice from our data object
      .call(
        (text) =>
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
            .text((d) => d.data.name) // set the actual text to the name in the data from our data object
      )

      // inside this particular block, we are setting the value of the give slice from our data object
      .call(
        (text) =>
          text
            .filter((d) => d.endAngle - d.startAngle > 0.25) // if the angle of the slice is > .25r, we show the label, otherwise we show nothing
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
            .text((d) => d.data.value.toLocaleString("en-US")) // set the actual text to the value of the slice from our data object
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // dependency array, this does not contain all possible variables that can change in here, this is for performance reasons
    color,
    currentTotal,
    data,
    onlyAdjustSubsequentSlices,
    stroke,
    textColor,
    radius,
  ]);

  // this useEffect() is for building our handles onto the main chart svg object
  // we have it here as we want these to change only when superficial aspects such as colour, radius, etc. change and not when the data changes
  // this is because the position of the handles is not updated from the DOM but rather from our interaction so they do not need to be recalculated
  // like the rest of the chart does
  // however, they do need to be recalculated if the colours change, the chart changes size, etc.
  useEffect(() => {
    // add another svg component to our original graph using the graphRef
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

    svg.selectAll("circle").remove(); // remove any previously created handles when they update

    // add our handles
    // this is done in a forEach() unlike the slices and labels above as despite the call()'s used to build them superficially acting like a forEach,
    // everything that is done in a call() acts upon everything created in that svg.append() block,
    // so if we didn't use a forEach() here, adjusting one handle would cause all the handles to move the same way
    arcs.forEach((slice, index) => {
      // add a handle to the svg
      svg
        .append("circle")
        .attr("cy", -(width / 2) * Math.cos(slice.endAngle))
        .attr("cx", (height / 2) * Math.sin(slice.endAngle))
        .attr("r", radius / 25)
        .attr("fill", data[index].color || (color(data[index].name) as string))
        .attr("stroke", stroke || "white")

        // this is where all the logic for the handles live
        // similar to the call()'s above, the circle parameter here refers to the generated circle component from the .append("circle") that we created
        // therefore, the subsequent call that we make on the circle parameter will successfully act upon that circle instead of acting upon the parent svg
        // this is a bit of a hack, but it does limit our scope in the way that we want and much like other d3 things, once you understand the pattern
        // it isn't too confusing
        .call((circle) =>
          circle.call(
            // @ts-expect-error jank typing weirdness built into d3
            d3.drag().on("drag", (e) => {
              // this is where we create our drag logic, 'e' is the drag event that we are using

              const mouseAngle = Math.atan(e.x / e.y); // calculate the angle of the mouse's position

              // this block just converts our mouseAngle into a useable value from 0 to 2Pi since the default atan() acts on Pi / 2 instead
              let mouseAngle360 =
                mouseAngle > 0 ? Math.PI - mouseAngle : Math.abs(mouseAngle);
              mouseAngle360 = e.x < 0 ? Math.PI + mouseAngle360 : mouseAngle360;
              mouseAngle360 =
                mouseAngle360 < arcs[index].startAngle &&
                !onlyAdjustSubsequentSlices
                  ? 2 * Math.PI + mouseAngle360
                  : mouseAngle360;

              // get the starting value of our current slice, i.e. the additive value of all previous slices in the pie
              const sliceStartValue = data
                .slice(0, index)
                .reduce((accumulator, slice) => accumulator + slice.value, 0);

              // generate a value out of the pie using the angle of the mouse's position as a percentage of the pie
              const sliceEndValue = total * (mouseAngle360 / (2 * Math.PI));

              // get the actual value that the curren slice should reflect
              const valueToSet =
                Math.round((sliceEndValue - sliceStartValue) * 100) / 100;

              // set's the currently manipulated slice so we don't adjust it through math back at the start since we're already manipulating it here
              setCurrentManipulatedIndex(index);

              // set the value in the data array to our new value or 0 if our new value is less than 0
              // this line is why data is not included in our dependency array below because its very easy to cause infinite loops
              // if we edit data -> recalculate -> recalculating edits data -> recalculate -> etc.
              data[index].set(valueToSet > 0 ? valueToSet : 0);
            })
          )
        );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, radius, stroke]); // dependency array

  return (
    <>
      <svg ref={graphRef as unknown as RefObject<SVGSVGElement>}></svg>
    </>
  );
}

export { DraggablePieChart };
