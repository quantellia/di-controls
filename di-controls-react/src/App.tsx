import { useRef, useState } from "react";
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

const sizeBounds = [3, 5.3, 10.6, 15.9, 21.2, 28.2, 40];
const sizeLabels = ["S", "M", "L1", "L2", "XL", "G"];
const semanticCounting = ["First", "Second", "Third"];

function isBetween(value: number, lowerBound: number, upperBound: number) {
  return lowerBound <= value && value < upperBound;
}

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
    operations++;
    if (sum > max) break;
  }
  return {
    sum,
    operations,
    toStorage,
    toBox,
  };
};
// end theft

function App() {
  // const fieldsExtensions = [
  //   'gid=20239935#gid=20239935',
  //   'gid=1948855152#gid=1948855152',
  //   'gid=723079312#gid=723079312',
  //   'gid=917758739#gid=917758739',
  //   'gid=2015691600#gid=2015691600',
  //   'gid=930732662#gid=930732662',
  //   'gid=2121428582#gid=2121428582',
  //   'gid=535554991#gid=535554991',
  //   'gid=285458021#gid=285458021',
  //   'gid=591732537#gid=591732537'
  // ]

  // const fieldsPromises = useRef(fieldsExtensions.map((value) => fetch(
  //   `https://docs.google.com/spreadsheets/d/1tG8a55vwriYvKbSx23KOjBLhMS-OX0oFaKzSMl9fvYI/export?format=tsv&${value}`
  // ).then((response) => response.text().then((text) => text.replace('\r\n', '\n').split('\n')))))

  const updateXarrow = useXarrow();
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
  const getDefaultPos = (key: string) => {
    const posString = localStorage.getItem(key);

    if (!posString) return undefined;

    const posStringArray = posString.split(", ");
    const x = parseInt(posStringArray[0]);
    const y = parseInt(posStringArray[1]);
    return { x: x, y: y };
  };

  const numFields = 10;
  const fieldSelectionArray = Array.from(
    { length: numFields + 1 },
    (_, field) => (field === numFields ? "No Field" : `Field ${field + 1}`)
  );

  const sizeCheckboxesObject = sizeLabels.map((label) => ({
    name: label,
    checked: false,
  }));

  const [day1Order1Fields, setDay1Order1Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);
  const day1Order1Boxes = 5;
  const [day1Order1Sizes, setDay1Order1Sizes] = useState(
    sizeCheckboxesObject.map((size) =>
      ["S", "L1"].includes(size.name) ? { ...size, checked: true } : size
    )
  );

  const [day1Order2Fields, setDay1Order2Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);
  const day1Order2Boxes = 5;
  const [day1Order2Sizes, setDay1Order2Sizes] = useState(
    sizeCheckboxesObject.map((size) =>
      ["L1", "XL"].includes(size.name) ? { ...size, checked: true } : size
    )
  );

  const [day1Order3Fields, setDay1Order3Fields] = useState([
    "Field 1",
    "No Field",
    "No Field",
  ]);
  const day1Order3Boxes = 7;
  const [day1Order3Sizes, setDay1Order3Sizes] = useState(
    sizeCheckboxesObject.map((size) =>
      ["M", "L2"].includes(size.name) ? { ...size, checked: true } : size
    )
  );

  const fields = useRef(
    Array.from({ length: numFields }, () => {
      // TODO: test data, replace will fetch from spreadsheet eventually
      const length = Math.floor(Math.random() * 300 + 800);
      return {
        length,
        potatoes: Array.from(
          { length },
          () => RoundToDecimal(Math.random() * 37 + 3, 2) // limits each potato to 2 decimal places
        ),
        potatoesTakenPerOrder: {
          total: 0,
          inOperation: [[0]],
        },
      };
    })
  );

  // const days = 3;

  const sizes = useRef(
    sizeLabels.map((value, index) => ({
      classification: value,
      lowerBound: sizeBounds[index],
      upperBound: sizeBounds[index + 1],
    }))
  );

  const orders = [
    {
      order: 1,
      unmappedFields: day1Order1Fields,
      fields: day1Order1Fields
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      setFields: setDay1Order1Fields,
      numberOfBoxes: day1Order1Boxes,
      sizes: day1Order1Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: day1Order1Sizes, // TODO: find a way to merge this into the 'sizes' attribute for all orders
      setSizes: setDay1Order1Sizes,
      colour: "#81a5c3",
      colourScheme: d3.interpolateHsl("#426a8a", "#bacede"),
    },
    {
      order: 2,
      unmappedFields: day1Order2Fields,
      fields: day1Order2Fields
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      setFields: setDay1Order2Fields,
      numberOfBoxes: day1Order2Boxes,
      sizes: day1Order2Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: day1Order2Sizes,
      setSizes: setDay1Order2Sizes,
      colour: "#8f79aa",
      colourScheme: d3.interpolateHsl("#5c4a73", "#c3b7d1"),
    },
    {
      order: 3,
      unmappedFields: day1Order3Fields,
      fields: day1Order3Fields
        .map((field) => {
          const fieldNum = field.split(" ")[1];
          return fieldNum !== "Field" ? parseInt(fieldNum) - 1 : undefined;
        })
        .filter((value) => value !== undefined),
      numberOfBoxes: day1Order3Boxes,
      setFields: setDay1Order3Fields,
      sizes: day1Order3Sizes
        .map((size, index) => (size.checked ? index : undefined))
        .filter((value) => value !== undefined),
      allSizes: day1Order3Sizes,
      setSizes: setDay1Order3Sizes,
      colour: "#c78dd0",
      colourScheme: d3.interpolateHsl("#a047ae", "#ead4ed"),
    },
  ];

  const pullFromStorage = true;
  const storage: SeparatedField = {
    // these numbers are the number of boxes, not the number of potatoes.  We just use the same data structure since it's easier
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
  fields.current.map((field) => {
    field.potatoesTakenPerOrder = { total: 0, inOperation: [[0]] };
  });

  const boxOunces = 640; // 40lbs

  const fieldMakeup = useRef<SeparatedField[]>(
    fields.current.map((field) => {
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
    })
  );

  // console.log(fields);

  const orderDetails = orders.map((order, orderIndex) => {
    const ouncesPacked = {
      sum: 0,
      operations: [0],
      toStorage: [[[0]]],
      toStorageFlattish: [[0]],
      toBox: [[[0]]],
    };
    ouncesPacked.toStorage.pop();
    ouncesPacked.toBox.pop();
    const orderStatus = {
      ...order,
      ouncesPacked: ouncesPacked,
      isFulfilled: false,
      boxesPacked: 0,
      costs: {
        fieldSwitchingCost: 0,
        storageCost: 0,
        wagesCost: 0,
      },
    };
    let numFieldSwitches = 0;

    const ouncesOrdered = boxOunces * order.numberOfBoxes;

    let size = orderStatus.sizes[orderStatus.sizes.length - 1];
    while (
      pullFromStorage &&
      !orderStatus.isFulfilled &&
      size >= orderStatus.sizes[0]
    ) {
      const difference = orderStatus.numberOfBoxes - orderStatus.boxesPacked;
      const currentStorageBins = storage[sizes.current[size].classification];

      orderStatus.boxesPacked +=
        currentStorageBins[0] - difference < 0
          ? currentStorageBins[0]
          : difference;

      currentStorageBins[0] = Math.max(0, currentStorageBins[0] - difference);
      orderStatus.isFulfilled =
        orderStatus.boxesPacked >= orderStatus.numberOfBoxes;
      size--;
    }

    for (let i = 0; i < order.fields.length; i++) {
      // if (orderStatus.isFulfilled) break;
      const currentField = fields.current[order.fields[i]];
      const ouncesFromField = getMaxSum(
        currentField.potatoes.slice(
          orderIndex === 0 ? 0 : currentField.potatoesTakenPerOrder.total
        ),
        ouncesOrdered - ouncesPacked.sum,
        sizes.current[order.sizes[order.sizes.length - 1]].upperBound,
        sizes.current[order.sizes[0]].lowerBound
      );

      fields.current[order.fields[i]].potatoesTakenPerOrder.inOperation[
        orderIndex
      ] = currentField.potatoes.slice(0, ouncesFromField.operations);
      fields.current[order.fields[i]].potatoesTakenPerOrder.total =
        fields.current[
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

      ouncesPacked.operations[i] = ouncesFromField.operations;
      ouncesPacked.sum += ouncesFromField.sum;
      ouncesPacked.toStorage.push(ouncesFromField.toStorage);
      ouncesPacked.toStorageFlattish = ouncesFromField.toStorage.map(
        (size, sizeIndex) => [
          ...size,
          ...(ouncesPacked.toStorageFlattish[sizeIndex] || []),
        ]
      );
      ouncesPacked.toBox.push(ouncesFromField.toBox);
      orderStatus.ouncesPacked = ouncesPacked;
      orderStatus.isFulfilled = ouncesPacked.sum >= ouncesOrdered;
      orderStatus.boxesPacked = ouncesPacked.sum / boxOunces;
    }

    const costs = {
      fieldSwitchingCost: numFieldSwitches * switchFieldCost,
      storageCost: 0,
      wagesCost:
        ((numFieldSwitches * minutesSpentToSwitchFields +
          (orderStatus.ouncesPacked.sum / 16) * packMinutesPerPound) /
          60) *
        hourlyWorkRate,
    };

    orderStatus.costs = costs;

    return orderStatus;
  });

  console.log("orderDetails", orderDetails);

  // move the toStorage stuff in each order to storage
  sizeLabels.map((size, index) => {
    orderDetails.forEach((order, orderIndex) => {
      storage[size][orderIndex] = Math.ceil(
        (order.ouncesPacked.toStorageFlattish[index] || [0]).reduce(
          (acc, cur) => acc + cur
        ) / boxOunces
      );
    });
  });

  orderDetails.forEach((order, orderIndex) => {
    order.costs.storageCost =
      Object.values(storage)
        .map((size) => size[orderIndex])
        .reduce((acc, cur) => acc + cur) * storageCostPerBox;
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
  const totalRevenue = RoundToDecimal(
    orderDetails
      .map(
        (order) =>
          clamp(Math.ceil(order.boxesPacked), 0, order.numberOfBoxes) *
          revenuePerBox
      )
      .reduce((acc, cur) => acc + cur, 0),
    2
  );

  return (
    <Xwrapper>
      <div style={{ /*width: 1920, */ height: 1080, fontFamily: "sans-serif" }}>
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
                    <legend>{`Order ${index + 1}`}</legend>
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
                      title={`Order ${index + 1} Size`}
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
                    maxY={400}
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
              style={{ display: "grid", width: "fit-content" }}
              id="boxesPacked"
            >
              <legend>Boxes Packed Per Order</legend>
              {orderDetails.map((order, index) => (
                <Gauge
                  title={`Order ${index + 1}`}
                  min={0}
                  max={order.numberOfBoxes}
                  currentValue={clamp(
                    Math.ceil(order.boxesPacked),
                    0,
                    order.numberOfBoxes
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
                <StackedBarplot
                  width={200}
                  height={200}
                  data={{
                    title: "Stored Boxes",
                    xAxisLabels: sizeLabels,
                    components: orderDetails.map((order, orderIndex) => ({
                      title: `Order ${orderIndex + 1}`,
                      values: sizeLabels.map(
                        (size) => storage[size][orderIndex] || 0
                      ),
                      color: order.colour,
                    })),
                  }}
                  maxY={60}
                />
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
                            ...Array(orders.length).fill(0),
                            RoundToDecimal(totalRevenue - totalCost, 2),
                          ],
                          color: "#95d491",
                        },
                      ],
                    }}
                    maxY={totalRevenue + totalRevenue / 10}
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
