import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import more from "highcharts/highcharts-more";
import draggable from "highcharts/modules/draggable-points";
import { TooltipObj } from "../types/global-types";
import "../index.css";

interface ChartProps {
  title: string;
  xAxisData: Array<number>;
  yAxisData: Array<number>;
  yAxisLabel: string;
  tooltip: TooltipObj | undefined;
  currentValue: Array<number>;
  setCurrentValue: React.Dispatch<React.SetStateAction<Array<number>>>;
}

if (typeof Highcharts === "object") {
  more(Highcharts);
  draggable(Highcharts);
}

function Chart({
  title,
  xAxisData,
  yAxisData,
  yAxisLabel,
  tooltip,
  currentValue,
  setCurrentValue,
}: ChartProps) {
  const yMax = Math.max(...yAxisData);
  const defaultTooltip = {
    formatter: function () {
      return "";
    },
    positioner: function () {
      return { x: 0, y: 0 };
    },
  };

  return (
    <>
      <HighchartsReact
        containerProps={{ className: "chart" }}
        highcharts={Highcharts}
        constructorType="chart"
        options={{
          chart: {
            animation: true,
            zoomType: "x",
            type: "area",
            backgroundColor: "transparent",
          },
          credits: {
            enabled: false,
          },

          legend: {
            enabled: false,
          },

          title: {
            text: title,
            align: "left",
            style: {
              color: "black",
              fontSize: "10px",
            },
          },

          xAxis: {
            categories: xAxisData,
            labels: {
              style: {
                color: "black",
                // fontSize: "6px",
                padding: 0,
              },
            },
          },

          yAxis: {
            title: {
              style: {
                color: "black",
                // fontSize: "6px",
              },
              text: yAxisLabel,
            },
            max: yMax,
            labels: {
              style: {
                color: "black",
                // fontSize: "6px",
                padding: 0,
              },
            },
          },

          tooltip: {
            formatter: function () {
              const x: number = Math.round(this.x);
              const y: number = Math.round(this.y);
              return tooltip?.message(x, y);
            },
            positioner: tooltip?.position ?? defaultTooltip.positioner,
            shadow: false,
            backgroundColor: "rgba(255,255,255,0.6)",
            crosshairs: [true, true],
          },

          plotOptions: {
            series: {
              stacking: "normal",
              cursor: "ns-resize",
              point: {
                events: {
                  drag: function (e) {
                    if (e.newPoint) {
                      const newValues = currentValue.map((v, i) =>
                        i === e.newPoints[this.id].point.x
                          ? Math.floor(e.newPoint.y)
                          : v
                      );
                      setCurrentValue(newValues);
                    }
                  },
                  update: function (e) {
                    if (e.newPoint) {
                      const newValues = currentValue.map((v, i) =>
                        i === e.newPoints[this.id].point.x
                          ? Math.floor(e.newPoint.y)
                          : v
                      );
                      setCurrentValue(newValues);
                    }
                  },
                },
              },
              stickyTracking: false,
            },
          },

          series: [
            {
              data: yAxisData,
              dragDrop: {
                draggableY: true,
                dragMinY: 0,
                dragMaxY: yMax,
              },
              type: "area",
              minPointLength: 2,
              name: "Avg Improvement",
            },
          ],
        }}
      />
    </>
  );
}

export default Chart;
