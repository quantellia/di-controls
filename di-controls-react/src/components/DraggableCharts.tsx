import Color from "color";
import * as d3 from "d3";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Slider } from "./BasicControls";
import Draggable from "react-draggable";
import { ArcherElement } from "react-archer";

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

interface DraggableAreaChartProps {
  data: Array<{
    xValue?: number;
    value: number;
    set: React.Dispatch<React.SetStateAction<number>>;
  }>;
  width?: number;
  height?: number;
  isAreaChart?: boolean;
  color?: string;
  areaColor?: string;
  textColor?: string;
  stroke?: string;
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

type Node = {
  name?: string;
  value?: number;
  color?: string;
  set?: React.Dispatch<React.SetStateAction<number>>;
  children?: Array<Node>;
};

interface TreemapProps {
  width?: number;
  height?: number;
  data: Node;
  d3ColorScheme?: d3Interpolate;
}

/**
 *
 * @param {{name: string, color: string, value: number, set: React.Dispatch<React.SetStateAction<number>>}} data Array of objects of type {name, color?, value, set} where 'value' and 'set' are derived from useState()
 * @param {number} [radius=500] OPTIONAL, radius in pixels of the piechart element, default 500
 * @param {boolean} [isDonut=false] OPTIONAL, whether or not the piechart is hollow, default false
 * @param {d3Interpolate} [d3ColorScheme=d3.interpolateSpectral] OPTIONAL, d3 interpolate function for easily generating color schemes, default d3.interpolateSpectral
 * @param {string=} textColor OPTIONAL, override for text color, default adjusts text color based on luminosity of each slice
 * @param {string=} stroke OPTIONAL, override for stroke color around elements, default white
 * @param {boolean} [onlyAdjustSubsequentSlices=false] OPTIONAL, override to only adjust slices ocurring 'after' the one being dragged, order starts from the top right element and then moves clockwise.  Can improve precision but causes all slices 'before' the one being edited to not readjust automatically, default false
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

  const renderPieChart = useCallback(() => {
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

  // this usMemo() is here as we want to re-render our piechart whenever any of the variables that it builds itself from change
  // these variables are contained in the dependency array at the bottom of the function
  useEffect(() => renderPieChart());

  const renderHandles = useCallback(() => {
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
  }, [color, radius, stroke]);

  // this useEffect() is for building our handles onto the main chart svg object
  // we have it here as we want these to change only when superficial aspects such as colour, radius, etc. change and not when the data changes
  // this is because the position of the handles is not updated from the DOM but rather from our interaction so they do not need to be recalculated
  // like the rest of the chart does
  // however, they do need to be recalculated if the colours change, the chart changes size, etc.
  useEffect(() => renderHandles()); // dependency array

  return (
    <>
      <svg ref={graphRef as unknown as RefObject<SVGSVGElement>} />
    </>
  );
}

/**
 *
 * @param {{value: number, xValue: number, set: React.Dispatch<React.SetStateAction<number>>}}data  Array of objects of type {value, xValue, set} where value and set are stateful values
 * @param {number} width OPTIONAL, width of the linechart component, default 500
 * @param {number} height OPTIONAL, height of the line chart component, default 500
 * @param {boolean} isAreaChart OPTIONAL, whether or not to color the area under the line, default false
 * @param {string} color OPTIONAL, color of the line, default "#69b3a2"
 * @param {string} areaColor OPTIONAL, color of the area under the line if isAreaChart=true, default "rgba(105, 179, 162, 0.3)"
 * @param {string} textColor OPTIONAL, color of the text, default "rgba(105, 179, 162, 0.3)"
 * @param {string} stroke OPTIONAL, color of the stroke around handles, default "white"
 */
function DraggableLineChart({
  data,
  width = 500,
  height = 500,
  isAreaChart = false,
  color = "#69b3a2",
  areaColor = "rgba(105, 179, 162, 0.3)",
  textColor = "black",
  stroke = "white",
}: DraggableAreaChartProps) {
  const graphRef = useRef(null); // creates the persistent ref object used to store the svg for the graph
  const graphValues = data.map((point, index) => ({
    // maps the data array into an array that we can use better in the actual chart
    x: point.xValue || index,
    y: point.value,
    set: point.set,
  }));
  const maxXValue = Math.max(
    // gets the highest xValue from the data array
    ...data
      .filter((point) => point.xValue !== undefined)
      .map((point) => point.xValue || 0)
  );

  const [, yMax] = d3.extent(data, (d) => d.value); // gets the highest y value from the data array
  const yScale = useMemo(() => {
    // creates a d3 linear scale for use in constructing the graph, the scale itself maps our values to pixel height
    return d3
      .scaleLinear()
      .domain([0, yMax || 0])
      .range([height - 20, 10]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, height]);

  const xScale = useMemo(() => {
    // creates a d3 linear scale for use in construction the graph, similar to the yScale
    return d3
      .scaleLinear()
      .domain([0, Math.max(maxXValue, data.length)])
      .range([30, width - 10]);
  }, [data.length, maxXValue, width]);

  useEffect(() => {
    const svg = d3.select(graphRef.current); // create an SVG on the persistent ref object
    svg.selectAll("*").remove(); // remove everything for re-rendering when anything changes
    const xAxisGenerator = d3.axisBottom(xScale); // creates the xAxis of the chart

    // add the xAxis to the chart
    svg
      .append("g")
      .call(xAxisGenerator)
      .attr("transform", "translate(0," + (height - 20) + ")")
      .attr("color", textColor);

    // add they yAxis to the chart
    const yAxisGenerator = d3.axisLeft(yScale);
    svg
      .append("g")
      .call(yAxisGenerator)
      .attr("transform", "translate(" + 30 + ",0)")
      .attr("color", textColor);

    // Add the area under the graph
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
          .x((d) => xScale(d.x))
          //@ts-expect-error jank typing built into d3
          .y((d) => yScale(d.y))
      );

    // create the handles for each point on the graph for use later
    graphValues.forEach((point) => {
      svg
        .append("circle")
        .attr("fill", color)
        .attr("stroke", stroke)
        .attr("cx", () => xScale(point.x))
        .attr("cy", () => yScale(point.y))
        .attr("r", 6)
        .call(
          (
            circle // onDrag function
          ) =>
            circle.call(
              // @ts-expect-error jank typing built into d3
              d3.drag().on("drag", (e) => {
                const newY = e.y < height - 20 ? e.y : height - 20;
                point.set(yScale.invert(newY));
              })
            )
        );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // return the SVG with the given dimensions
  return <svg width={width} height={height} ref={graphRef} />;
}

/**
 *
 * @param {number} currentValue stateful value with the number to represent in the gauge
 * @param {React.Dispatch<React.SetStateAction<number>>} set setState function to update the currentValue
 * @param {string} title text under the currentValue
 * @param {number} min minimum number on the gauge
 * @param {number} max maximum number on the gauge
 * @param {number} radius OPTIONAL, radius of the gauge, default 500
 * @param {string} d3ColorScheme OPTIONAL, d3.Interpolate function to generate a color scheme, default d3.interpolateHslLong("red", "limegreen")
 * @param {boolean} reverseColorScheme OPTIONAL, whether or not to invert the direction the colorscheme flows in, default false
 */
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

  return (<>
  
    <ArcherElement id={title} relations={[
      {
        targetId: 'profit',
        targetAnchor:'left',
        sourceAnchor: "right",
      }
    ]}><div>
      <Draggable nodeRef={gaugeRef as RefObject<HTMLElement>}>
        <svg ref={gaugeRef} />
        </Draggable>
      </div>
    </ArcherElement>
    </>)
  
}

/**
 *
 * @param {Node} data Object with the data to represent, formatted as {children: {name: string, children: {name: string, value: number, set: function}[]}[]}, can go as many layers deep as needed
 * @param {number} width OPTIONAL, the width of the treemap component, default 500
 * @param {number} height OPTIONAL, the height of the treemap component, default 500
 * @param {d3Interpolate} d3ColorScheme OPTIONAL, the d3Interpolate function to use for the treemap's colorscheme, default d3.interpolateSpectral
 */
function DraggableTreeMap({
  width = 500,
  height = 500,
  data,
  d3ColorScheme = d3.interpolateSpectral,
}: TreemapProps) {
  const graphRef = useRef(null);
  const [, setCurrentValue] = useState(0);
  const [currentSection, setCurrentSection] = useState<Node>();
  const hierarchy = useMemo(() => {
    return d3.hierarchy(data).sum((d) => d.value || 0);
  }, [data]);

  // List of item of level 1 (just under root) & related color scale
  const firstLevelGroups = hierarchy?.children?.map(
    (child) => child.data.name || ""
  );
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(firstLevelGroups || [])
    .range(
      d3
        .quantize(
          (t) => d3ColorScheme(t * 0.8 + 0.1),
          data.children?.length || 0
        )
        .reverse()
    );

  const root = useMemo(() => {
    const treeGenerator = d3
      .treemap<Node>()
      .size([width, height])
      .padding(4)
      .paddingTop(20);
    return treeGenerator(hierarchy);
  }, [hierarchy, width, height]);
  const descendants = root.descendants();

  const total = root.leaves().reduce((acc, curr) => acc + (curr.value || 0), 0);

  const svg = d3
    .select(graphRef.current)
    .attr("width", width)
    .attr("height", height)
    .attr("style", `max-width: 100%; height: auto; font: 12px sans-serif;`);

  useEffect(() => {
    svg.selectAll("g").remove();

    descendants.forEach((child) => {
      if (child.data.name) {
        if (!child.data.color)
          child.data.color =
            child.parent === root
              ? d3.color(colorScale(child.data.name || "")) + ""
              : d3.color(child.parent?.data.color || "")?.brighter(0.5) + "";

        const group = svg.append("g").attr("display", "flex");
        group
          .append("rect")
          .attr("x", child.x0)
          .attr("y", child.y0)
          .attr("width", child.x1 - child.x0)
          .attr("height", child.y1 - child.y0)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("fill", child.data.color)
          .on("click", () => setCurrentSection(child.data));

        group
          .append("text")
          .attr("x", child.x0 + 6)
          .attr("y", child.y0 + 13)
          .attr("font-size", 12)
          .attr("text-anchor", "start")
          // .attr("alignment-baseline", "hanging")
          .attr("fill", "black")
          .attr("font-weight", "bold")
          .text(child.data.name || "");

        group
          .append("text")
          .attr("x", child.x0 + 6)
          .attr("y", child.y0 + 28)
          .attr("font-size", 12)
          .attr("fill-opacity", 0.7)
          .attr("text-anchor", "start")
          .attr("alignment-baseline", "hanging")
          .attr("fill", "black")
          .text(child.data.value || "");
      }
    });
  });

  return (
    <>
      {currentSection && (
        <Slider
          title={currentSection.name || ""}
          min={0}
          max={total}
          step={1}
          currentValue={
            descendants.find((node) => node.data.name === currentSection.name)
              ?.value || 0
          }
          setCurrentValue={currentSection.set || setCurrentValue}
        />
      )}
      <svg width={width} height={height} ref={graphRef} />
    </>
  );
}

export {
  DraggablePieChart,
  DraggableLineChart,
  DraggableGauge,
  DraggableTreeMap,
};
