import { useCallback, useEffect, useRef, useState } from "react";
import { Gauge, StackedBarplot } from "./components/DataVisualizations";
import { CheckBoxGroup } from "./components/BasicControls";
import * as d3 from "d3";
import Draggable from "react-draggable";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { Dial } from "./components/Controls";

interface SeparatedField {
  [key: string]: number[];
  S: number[];
  M: number[];
  L1: number[];
  L2: number[];
  XL: number[];
  G: number[];
}

interface OrderObject {
  day: number;
  order: number;
  unmappedFields: string[];
  fields: number[];
  setFields: React.Dispatch<React.SetStateAction<string[]>>;
  numberOfBoxes: number;
  sizes: number[];
  allSizes: {
    name: string;
    checked: boolean;
  }[];
  setSizes: React.Dispatch<
    React.SetStateAction<
      {
        name: string;
        checked: boolean;
      }[]
    >
  >;
  colour: string;
  colourScheme: (t: number) => string;
}

interface OuncesPackedObject {
  sum: number;
  operations: number[];
  toStorage: number[][][];
  toBox: number[][][];
}

type OrderStatusObject = OrderObject & {
  ouncesPacked: OuncesPackedObject;
  isFulfilled: boolean;
  storedBoxes: number[][];
  boxesPacked: number;
  costs: {
    fieldSwitchingCost: number;
    storageCost: number;
    wagesCost: number;
  };
};

const sizeBounds = [3, 5.3, 10.6, 15.9, 21.2, 28.2, 40];
const sizeLabels = ["S", "M", "L1", "L2", "XL", "G"];
const semanticCounting = ["First", "Second", "Third"];


//Helper functions
function isBetween(value: number, lowerBound: number, upperBound: number) {
  return lowerBound <= value && value < upperBound;
}

//Used when we load the spreadsheet data
function addToField(field: number[][], potato: number) {
  for (let i = 0; i < sizeBounds.length; i++) {
    if (potato < sizeBounds[i]) {
      field[i - 1].push(potato);
      break;
    }
  }
}

function RoundToDecimal(value: number, places: number) {
  return Math.round((value + Number.EPSILON) * 10 ** places) / 10 ** places;
}

function clamp(num: number, lower: number, upper: number) {
  return Math.min(Math.max(num, lower), upper);
}

// theft
const getMaxSum = (
  dataset: number[],
  max: number,
  upperBound: number,
  lowerBound: number
) => {
  let sum = 0,
    num,
    operations = 0;
  const toStorage: number[][] = [[0], [0], [0], [0], [0], [0]];
  const toBox: number[][] = [[0], [0], [0], [0], [0], [0]];

  const addToSumAndBox = (num: number) => {
    sum += num;
    addToField(toBox, num);
  };

  for (num of dataset) {
    lowerBound < num && num < upperBound
      ? addToSumAndBox(num)
      : addToField(toStorage, num);
    operations++; //Used for graph telemetry
    if (sum > max) break; //Order satisfied, stop packing
  }
  return {
    sum,
    operations,
    toStorage,
    toBox,
  };
};
// end theft


// -----
// REACT STUFF STARTS HERE
// -----

function App() {
  const [fieldsArray, setFieldsArray] = useState<number[][]>([[]]);
  const boxesPackedPerOrder = useRef([0, 0, 0]);

  const fields = fieldsArray.map((field) => ({
    length: field.length,
    potatoes: field,
    potatoesTakenPerOrder: {
      total: 0,
      inOperation: [[0]],
    },
  }));

  useEffect(() => {
    const fieldsExtensions = [
      "gid=20239935#gid=20239935",
      "gid=1948855152#gid=1948855152",
      "gid=723079312#gid=723079312",
      "gid=917758739#gid=917758739",
      "gid=2015691600#gid=2015691600",
      "gid=930732662#gid=930732662",
      "gid=2121428582#gid=2121428582",
      "gid=535554991#gid=535554991",
      "gid=285458021#gid=285458021",
      "gid=591732537#gid=591732537",
    ];

    const generatedArr: number[][] = [[]];

    fieldsExtensions.map(async (value, index) => {
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/1tG8a55vwriYvKbSx23KOjBLhMS-OX0oFaKzSMl9fvYI/export?format=tsv&${value}`
      );
      generatedArr[index] = (await response.text())
        .valueOf()
        .replace("\r\n", "\n")
        .split("\n")
        .map((line) => parseFloat(line.split("\t")[1]))
        .filter((num) => !Number.isNaN(num));
    });
    setFieldsArray(generatedArr); //This is a useState
  }, []);

  const updateXarrow = useXarrow();


  //Store positions for per-session persistence
  const serializePosition = (key: string) => {
    localStorage.setItem(
      key,
      window
        // @ts-expect-error it exists bro
        .getComputedStyle(document.getElementById(key))
        .getPropertyValue("transform")
        .split(" ")
        .slice(-2)
        .join(" ")
        .replace(")", "")
    );
  };
  //Load stored positions
  const getDefaultPos = (key: string) => {
    const posString = localStorage.getItem(key);

    if (!posString) return undefined;

    const posStringArray = posString.split(", ");
    const x = parseInt(posStringArray[0]);
    const y = parseInt(posStringArray[1]);
    return { x: x, y: y };
  };



  //Used in the dials. Defines an array of selectable field values
  const numFields = 10;
  const fieldSelectionArray = Array.from(
    { length: numFields + 1 },
    (_, field) => (field === numFields ? "No Field" : `Field ${field + 1}`)
  );

  //Checkboxes
  const sizeCheckboxesObject = sizeLabels.map((label) => ({
    name: label,
    checked: false,
  }));

  //Dials
  const [day1Order1Fields, setDay1Order1Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);
  const [day2Order1Fields, setDay2Order1Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);
  const [day3Order1Fields, setDay3Order1Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);
  
  //Define number of boxes for the first order
  const order1Boxes = 5;
  const [order1Sizes, setOrder1Sizes] = useState(
    sizeCheckboxesObject.map((size) =>
      ["S", "L1"].includes(size.name) ? { ...size, checked: true } : size
    )
  );

  const [day1Order2Fields, setDay1Order2Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);
  const [day2Order2Fields, setDay2Order2Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);
  const [day3Order2Fields, setDay3Order2Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);

  //Order 2
  const order2Boxes = 5;
  const [order2Sizes, setOrder2Sizes] = useState(
    sizeCheckboxesObject.map((size) =>
      ["L1", "XL"].includes(size.name) ? { ...size, checked: true } : size
    )
  );

  const [day1Order3Fields, setDay1Order3Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);
  const order3Boxes = 7;
  const [order3Sizes, setOrder3Sizes] = useState(
    sizeCheckboxesObject.map((size) =>
      ["M", "L2"].includes(size.name) ? { ...size, checked: true } : size
    )
  );



  const sizes = useRef(
    sizeLabels.map((value, index) => ({
      classification: value,
      lowerBound: sizeBounds[index],
      upperBound: sizeBounds[index + 1],
    }))
  );

  // -----
  // "The main meat of where everything comes from"
  // -----

  const orders = [
    {
      day: 1,
      order: 1,
      unmappedFields: day1Order1Fields,
      fields: day1Order1Fields  //List of fields that we've selected on the dials (mapped and filtered by the dial I think)
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      setFields: setDay1Order1Fields,
      numberOfBoxes: order1Boxes,
      sizes: order1Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: order1Sizes, // TODO: find a way to merge this into the 'sizes' attribute for all orders
      setSizes: setOrder1Sizes,
      colour: "#81a5c3",
      colourScheme: d3.interpolateHsl("#426a8a", "#bacede"),
    },
    {
      day: 1,
      order: 2,
      unmappedFields: day1Order2Fields,
      fields: day1Order2Fields
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      setFields: setDay1Order2Fields,
      numberOfBoxes: order2Boxes,
      sizes: order2Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: order2Sizes,
      setSizes: setOrder2Sizes,
      colour: "#8f79aa",
      colourScheme: d3.interpolateHsl("#5c4a73", "#c3b7d1"),
    },
    {
      day: 1,
      order: 3,
      unmappedFields: day1Order3Fields,
      fields: day1Order3Fields
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      numberOfBoxes: order3Boxes,
      setFields: setDay1Order3Fields,
      sizes: order3Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: order3Sizes,
      setSizes: setOrder3Sizes,
      colour: "#c78dd0",
      colourScheme: d3.interpolateHsl("#a047ae", "#ead4ed"),
    },
    {
      day: 2,
      order: 1,
      unmappedFields: day2Order1Fields,
      fields: day2Order1Fields
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      setFields: setDay2Order1Fields,
      numberOfBoxes: order1Boxes,
      sizes: order1Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: order1Sizes, // TODO: find a way to merge this into the 'sizes' attribute for all orders
      setSizes: setOrder1Sizes,
      colour: "#81a5c3",
      colourScheme: d3.interpolateHsl("#426a8a", "#bacede"),
    },
    {
      day: 2,
      order: 2,
      unmappedFields: day2Order2Fields,
      fields: day2Order2Fields
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      setFields: setDay2Order2Fields,
      numberOfBoxes: order2Boxes,
      sizes: order2Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: order2Sizes,
      setSizes: setOrder2Sizes,
      colour: "#8f79aa",
      colourScheme: d3.interpolateHsl("#5c4a73", "#c3b7d1"),
    },
    {
      day: 3,
      order: 1,
      unmappedFields: day3Order1Fields,
      fields: day3Order1Fields
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      setFields: setDay3Order1Fields,
      numberOfBoxes: order1Boxes,
      sizes: order1Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: order1Sizes, // TODO: find a way to merge this into the 'sizes' attribute for all orders
      setSizes: setOrder1Sizes,
      colour: "#81a5c3",
      colourScheme: d3.interpolateHsl("#426a8a", "#bacede"),
    },
    {
      day: 3,
      order: 2,
      unmappedFields: day3Order2Fields,
      fields: day3Order2Fields
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      setFields: setDay3Order2Fields,
      numberOfBoxes: order2Boxes,
      sizes: order2Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: order2Sizes,
      setSizes: setOrder2Sizes,
      colour: "#8f79aa",
      colourScheme: d3.interpolateHsl("#5c4a73", "#c3b7d1"),
    },
  ];

  //-----
  // Simpler consts here
  // -----

  //Simple flag
  const pullFromStorage = true;

  const storage: SeparatedField = {
    // these numbers are the number of boxes, not the number of potatoes.  We just use the same data structure since it's easier
    // If S: [1, 3, 2] After order 1 there was 1 box, after order 2 there were 3 boxes
    S: [0],
    M: [0],
    L1: [0],
    L2: [0],
    XL: [0],
    G: [0],
  };

  const switchFieldCost = 30;
  const storageCostPerBox = 0.88;
  const packMinutesPerPound = 1;
  const hourlyWorkRate = 2;
  const minutesSpentToSwitchFields = 40;

  const revenuePerBox = 15;

  // reset potatoesTakenPerOrder
  fields.map((field) => {
    field.potatoesTakenPerOrder = { total: 0, inOperation: [[0]] };
  });

  const boxOunces = 640; // 40lbs

  // Categorizes a random field
  // Iterates through the field and sorts the values into categories, preserving original order
  const generateFieldMakeup = useCallback(
    () =>
      fields.map((field) => {
        const smalls = sizes.current[0];
        const mediums = sizes.current[1];
        const large1s = sizes.current[2];
        const large2s = sizes.current[3];
        const extraLarges = sizes.current[4];
        const giants = sizes.current[5];
        return {
          S: field.potatoes.filter((potato) =>
            isBetween(potato, smalls.lowerBound, smalls.upperBound)
          ),
          M: field.potatoes.filter((potato) =>
            isBetween(potato, mediums.lowerBound, mediums.upperBound)
          ),
          L1: field.potatoes.filter((potato) =>
            isBetween(potato, large1s.lowerBound, large1s.upperBound)
          ),
          L2: field.potatoes.filter((potato) =>
            isBetween(potato, large2s.lowerBound, large2s.upperBound)
          ),
          XL: field.potatoes.filter((potato) =>
            isBetween(potato, extraLarges.lowerBound, extraLarges.upperBound)
          ),
          G: field.potatoes.filter((potato) =>
            isBetween(potato, giants.lowerBound, giants.upperBound)
          ),
        };
      }),
    [fields] //Only call when fields updates
  );

  //Only do the above function once in a useref on page load
  const fieldMakeup = useRef<SeparatedField[]>(generateFieldMakeup());

  useEffect(() => {
    fieldMakeup.current = generateFieldMakeup();
  }, [generateFieldMakeup]);

  // console.log(fields);
  console.log("before storage", storage);

  // This will contain info about each order, including the initial order object and the results of packing that order
  // with the current decision parameters
  const orderDetails: OrderStatusObject[] = [];

  for (let i = 0; i < orders.length; i++) {
    const orderIndex = i;
    const order = orders[i];

    const ouncesPacked: OuncesPackedObject = {
      sum: 0,
      operations: [],
      toStorage: [],
      toBox: [],
    };

    //Initialize it
    const orderStatus: OrderStatusObject = {
      ...order,
      ouncesPacked: ouncesPacked,
      storedBoxes:
        orderIndex > 0 ? orderDetails[orderIndex - 1].storedBoxes : [], //Beyond the first order, grab this info from the previous order
      isFulfilled:
        order.day > 1
          ? boxesPackedPerOrder.current[order.order - 1] >= order.numberOfBoxes
          : false,
      boxesPacked:
        order.day > 1 ? boxesPackedPerOrder.current[order.order - 1] : 0,
      costs: {
        fieldSwitchingCost: 0,
        storageCost: 0,
        wagesCost: 0,
      },
    };
    let numFieldSwitches = 0;

    const ouncesOrdered = boxOunces * order.numberOfBoxes;
    const preStoredBoxes =
      orderIndex === 0
        ? []
        : orderDetails[orderIndex - 1].storedBoxes[orderIndex - 1];

    //Storage
    let size = orderStatus.sizes[orderStatus.sizes.length - 1];
    while (
      pullFromStorage &&
      orderIndex > 0 &&
      !orderStatus.isFulfilled &&
      size >= orderStatus.sizes[0]
    ) {
      //Grab from storage
      const difference = orderStatus.numberOfBoxes - orderStatus.boxesPacked;
      const currentStorageBins = preStoredBoxes[size];

      orderStatus.boxesPacked +=
        currentStorageBins - difference < 0 ? currentStorageBins : difference;

      preStoredBoxes[size] = Math.max(0, currentStorageBins - difference);
      orderStatus.isFulfilled =
        orderStatus.boxesPacked >= orderStatus.numberOfBoxes;
      orderStatus.ouncesPacked.sum = orderStatus.boxesPacked * boxOunces;
      size--;
    }

    console.log("boxesPacked", orderStatus.boxesPacked);

    //Fields
    for (let i = 0; i < order.fields.length; i++) {
      // if (orderStatus.isFulfilled) break;
      const currentField = fields[order.fields[i]];
      //Grab from fields
      const ouncesFromField = getMaxSum(
        orderStatus.isFulfilled
          ? []
          : currentField.potatoes.slice(
              orderIndex === 0 ? 0 : currentField.potatoesTakenPerOrder.total
            ),
        ouncesOrdered - ouncesPacked.sum,
        sizes.current[order.sizes[order.sizes.length - 1]].upperBound,
        sizes.current[order.sizes[0]].lowerBound
      );

      fields[order.fields[i]].potatoesTakenPerOrder.inOperation[orderIndex] =
        currentField.potatoes.slice(0, ouncesFromField.operations);
      fields[order.fields[i]].potatoesTakenPerOrder.total = fields[
        order.fields[i]
      ].potatoesTakenPerOrder.inOperation.reduce(
        (acc, cur) => acc + cur.length,
        0
      );

      numFieldSwitches =
        i +
        (orderIndex > 0 &&
        !orders[orderIndex - 1].fields.some((e) => order.fields.includes(e))
          ? 1
          : 0);

      //At least some of this is only needed for rendering
      ouncesPacked.operations[i] = ouncesFromField.operations;
      ouncesPacked.sum += ouncesFromField.sum;
      ouncesPacked.toStorage.push(ouncesFromField.toStorage);
      ouncesPacked.toBox.push(ouncesFromField.toBox);
      orderStatus.ouncesPacked = ouncesPacked;
      //Got a little hairy with toStorage, this is the value most recently uesd
      orderStatus.storedBoxes[orderIndex] = ouncesPacked.toStorage[0].map(
        (size, sizeIndex) =>
          Math.ceil(size.reduce((acc, cur) => acc + cur) / boxOunces) +
          (preStoredBoxes[sizeIndex] || 0)
      );
      orderStatus.isFulfilled =
        orderStatus.isFulfilled || ouncesPacked.sum >= ouncesOrdered;
      //This is done for weird graphical issues, error correction
      orderStatus.boxesPacked = orderStatus.isFulfilled
        ? order.numberOfBoxes
        : ouncesPacked.sum / boxOunces;
    }

    const costs = {
      fieldSwitchingCost: numFieldSwitches * switchFieldCost,
      storageCost: 0, //Calculated later
      wagesCost:
        ((numFieldSwitches * minutesSpentToSwitchFields +
          Math.max(
            orderStatus.ouncesPacked.sum / 16 -
              (order.day > 1
                ? boxesPackedPerOrder.current[order.order - 1] * 40
                : 0),
            0
          ) *
            packMinutesPerPound) /
          60) *
        hourlyWorkRate,
    };

    boxesPackedPerOrder.current[order.order - 1] = orderStatus.boxesPacked;

    orderStatus.costs = costs;

    //Add this order's status to the overall array
    orderDetails[orderIndex] = orderStatus;
  }

  //Start filling out storage costs
  orderDetails.forEach((order, index) => {
    order.costs.storageCost =
      Math.max(
        order.storedBoxes.flat().reduce((acc, cur) => acc + cur) -
          (index > 0
            ? orderDetails[index - 1].storedBoxes
                .flat()
                .reduce((acc, cur) => acc + cur)
            : 0),
        0
      ) * storageCostPerBox;
  });

  const totalCost = RoundToDecimal(
    orderDetails
      .map(
        (order) =>
          order.costs.fieldSwitchingCost +
          order.costs.storageCost +
          order.costs.wagesCost
      )
      .reduce((acc, cur) => acc + cur),
    2
  );

  console.log("orderDetails", orderDetails);
  const totalRevenue = RoundToDecimal(
    boxesPackedPerOrder.current
      .map((boxes, index) => {
        const numBoxes = clamp(
          Math.ceil(boxes),
          0,
          orderDetails[index].numberOfBoxes
        );
        return numBoxes === orderDetails[index].numberOfBoxes
          ? numBoxes * revenuePerBox
          : 0;
      })
      .reduce((acc, cur) => acc + cur, 0),
    2
  );
  console.log("totalRevenue", totalRevenue);
  console.log("totalCost", totalCost);


  // -----
  // RENDERING STARTS HERE
  // -----

  return (
    <Xwrapper>
      <div style={{ fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", gridAutoFlow: "column" }}>
          <Draggable
            defaultPosition={getDefaultPos("orders")}
            onDrag={updateXarrow}
            onStop={() => {
              updateXarrow();
              serializePosition("orders");
            }}
          >

            <fieldset style={{ display: "grid" }} id="orders">
              <legend>Orders</legend>
              {orders.map((order, index) => {
                return (
                  <fieldset style={{ display: "flex" }}>
                    <legend>{`Day ${order.day}, Order ${order.order}`}</legend>
                    {order.unmappedFields.map((field, fieldIndex) => (
                      <Dial
                        currentValue={field}
                        setCurrentValue={(newValue) => {
                          order.setFields(
                            order.unmappedFields.map((value, index) =>
                              index === fieldIndex ? newValue.toString() : value
                            )
                          );
                        }}
                        title={`${semanticCounting[fieldIndex]} Field`}
                        values={fieldSelectionArray}
                        radius={200}
                        d3ColorScheme={order.colourScheme}
                      />
                    ))}
                    <CheckBoxGroup
                      title={`Day ${order.day}, Order ${order.order} Size`}
                      currentValue={order.allSizes}
                      // setCurrentValue={order.setSizes}
                      key={`${index}-checkboxgrouporder`}
                    />
                  </fieldset>
                );
              })}
            </fieldset>
            
          </Draggable>

          <Draggable
            defaultPosition={getDefaultPos("fieldMakeup")}
            onDrag={updateXarrow}
            onStop={() => {
              updateXarrow();
              serializePosition("fieldMakeup");
            }}
          >
            <fieldset
              style={{ width: 1000, height: "fit-content" }}
              id="fieldMakeup"
            >
              <legend>Field Makeup</legend>
              {fieldMakeup.current?.map((field, fieldIndex) => {
                const fieldArray = Object.values(field);
                const potatoesTaken = orderDetails.map((order, orderIndex) => {
                  const indexOfFieldInOrder = order.fields.indexOf(fieldIndex);

                  if (indexOfFieldInOrder !== -1) {
                    const potatoesTakenThisOrder = sizes.current.map(
                      (_, sizeIndex) => {
                        return order.ouncesPacked.toBox[indexOfFieldInOrder][
                          sizeIndex
                        ].length === 1
                          ? order.ouncesPacked.toStorage[indexOfFieldInOrder][
                              sizeIndex
                            ]
                          : order.ouncesPacked.toBox[indexOfFieldInOrder][
                              sizeIndex
                            ];
                      }
                    );

                    return {
                      title: `Order ${orderIndex + 1}`,
                      values: potatoesTakenThisOrder.map(
                        (potatoArray) => potatoArray.length
                      ),
                      color: order.colour,
                    };
                  }

                  return { title: `Order ${orderIndex + 1}`, values: [] };
                });

                const totalPotatoesPerSize = fieldArray.map(
                  (size) => size.length
                );
                potatoesTaken.map((field) =>
                  field.values.forEach((size, sizeIndex) => {
                    totalPotatoesPerSize[sizeIndex] -= size;
                  })
                );

                return (
                  <StackedBarplot
                    width={200}
                    height={200}
                    data={{
                      title: `Field ${fieldIndex + 1}`,
                      xAxisLabels: sizeLabels,
                      components: [
                        {
                          title: `Field ${fieldIndex + 1}`,
                          values: totalPotatoesPerSize,
                          color: "#95d491",
                        },
                        ...potatoesTaken,
                      ],
                    }}
                    maxY={700}
                  />
                );
              })}
            </fieldset>
          </Draggable>
        </div>

        <div style={{ display: "flex" }}>
          <Draggable
            defaultPosition={getDefaultPos("boxesPacked")}
            onDrag={updateXarrow}
            onStop={() => {
              updateXarrow();
              serializePosition("boxesPacked");
            }}
          >
            <fieldset
              style={{
                display: "grid",
                width: "fit-content",
                height: "fit-content",
              }}
              id="boxesPacked"
            >
              <legend>Boxes Packed Per Order</legend>
              {boxesPackedPerOrder.current.map((boxes, index) => (
                <Gauge
                  title={`Order ${index + 1}`}
                  min={0}
                  max={orderDetails[index].numberOfBoxes}
                  currentValue={clamp(
                    Math.ceil(boxes),
                    0,
                    orderDetails[index].numberOfBoxes
                  )}
                  radius={200}
                  d3ColorScheme={d3.interpolateHsl("#b56d77", "#95d491")}
                />
              ))}
            </fieldset>
          </Draggable>

          <div>
            <Draggable
              defaultPosition={getDefaultPos("storage")}
              onDrag={updateXarrow}
              onStop={() => {
                updateXarrow();
                serializePosition("storage");
              }}
            >
              <fieldset
                style={{ width: "fit-content", height: "fit-content" }}
                id="storage"
              >
                <legend>Storage</legend>
                {orderDetails
                  .slice(-1)[0]
                  .storedBoxes.map((orderBoxes, index) => (
                    <StackedBarplot
                      width={200}
                      height={200}
                      data={{
                        title: `Day ${orders[index].day}, Order ${orders[index].order}`,
                        xAxisLabels: sizeLabels,
                        components: [
                          {
                            title: `Day ${orders[index].day}, Order ${orders[index].order}`,
                            values: orderBoxes,
                            color: orders[index].colour,
                          },
                        ],
                      }}
                      maxY={20}
                    />
                  ))}
              </fieldset>
            </Draggable>

            <div style={{ display: "flex" }}>
              <Draggable
                defaultPosition={getDefaultPos("profit")}
                onDrag={updateXarrow}
                onStop={() => {
                  updateXarrow();
                  serializePosition("profit");
                }}
              >
                <fieldset id="profit">
                  <legend>Profit</legend>
                  <StackedBarplot
                    width={500}
                    height={300}
                    data={{
                      title: "Cost / Profit Split",
                      xAxisLabels: [
                        "Field Switching Cost",
                        "Storage Cost",
                        "Wages Cost",
                        "Revenue",
                      ],
                      components: [
                        ...orderDetails.map((order, orderIndex) => {
                          const totalCost =
                            order.costs.fieldSwitchingCost +
                            order.costs.storageCost +
                            order.costs.wagesCost;

                          return {
                            title: `Order ${orderIndex + 1}`,
                            values: [
                              order.costs.fieldSwitchingCost,
                              order.costs.storageCost,
                              order.costs.wagesCost,
                              totalCost,
                            ],
                            color: order.colour,
                          };
                        }),
                        {
                          title: "Profit",
                          values: [
                            ...Array(boxesPackedPerOrder.current.length).fill(
                              0
                            ),
                            RoundToDecimal(totalRevenue - totalCost, 2),
                          ],
                          color: "#95d491",
                        },
                      ],
                    }}
                    maxY={totalRevenue + totalRevenue / 10}
                    stepHeight={100}
                  />
                </fieldset>
              </Draggable>
            </div>
          </div>
        </div>
      </div>
      <Xarrow start={"orders"} end={"fieldMakeup"} color="#b56d77" />
      <Xarrow start={"orders"} end={"profit"} color="#b56d77" />
      <Xarrow start={"fieldMakeup"} end={"boxesPacked"} color="#e19179" />
      <Xarrow start={"fieldMakeup"} end={"storage"} color="#e19179" />
      <Xarrow start={"boxesPacked"} end={"profit"} color="#e9e588" />
      <Xarrow start={"storage"} end={"profit"} color="#95d491" />
    </Xwrapper>
  );
}

export default App;
