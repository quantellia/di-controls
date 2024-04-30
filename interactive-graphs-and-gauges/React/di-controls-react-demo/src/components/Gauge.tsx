import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import SolidGauge from "highcharts/modules/solid-gauge";
import "../index.css";

if (typeof Highcharts === "object") {
  HighchartsMore(Highcharts);
  SolidGauge(Highcharts);
}

interface GaugeProps {
  title: string;
  maxValue: number;
  value: number;
  displayValue: string | undefined;
  measure: string;
}

function Gauge({ title, maxValue, value, displayValue, measure }: GaugeProps) {
  return (
    <HighchartsReact
      containerProps={{ className: "chart" }}
      highcharts={Highcharts}
      constructorType="chart"
      options={{
        chart: {
          type: "solidgauge",
        },

        pane: {
          center: ["50%", "85%"],
          size: "160%",
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: Highcharts.theme || "#EEE",
            innerRadius: "60%",
            outerRadius: "100%",
            shape: "arc",
          },
        },

        tooltip: {
          enabled: false,
        },

        // the value axis
        yAxis: {
          min: 0,
          max: maxValue,
          stops: [
            [0.1, "#3182bd"], // dark blue
            [0.5, "#addd8e"], // mid-green
            [0.9, "#31a354"], // darker green
          ],
          lineWidth: 0,
          minorTickInterval: null,
          tickPixelInterval: 400,
          tickWidth: 0,
          title: {
            y: -70,
          },
          labels: {
            y: 16,
          },
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true,
            },
          },
        },
        title: {
          text: title,
          style: {
            color: "purple",
            fontSize: "10px",
          },
        },

        credits: {
          enabled: false,
        },

        series: [
          {
            name: "Benefit",
            data: [value],
            dataLabels: {
              format: `<div style="text-align:center"><span style="font-size:25px;color:${
                Highcharts.theme || "black"
              }">${displayValue}</span><br/><span style="font-size:12px;color:silver">${measure}</span></div>`,
            },
            tooltip: {
              valueSuffix: " improvement",
            },
          },
        ],
      }}
    />
  );
}

export default Gauge;
