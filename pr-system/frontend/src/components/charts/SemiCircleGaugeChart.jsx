import React from "react";
import ReactApexChart from "react-apexcharts";
import ChartTitle from "./ChartTitle";

function SemiCircleGaugeChart({ series, labels }) {
  const options = {
    chart: {
      toolbar: { show: false },
      type: "radialBar",
      offsetY: -50,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: "97%",
       
        },
        dataLabels: {
          name: {
            show: true,
          },
          value: {
            offsetY: -50,
            fontSize: "22px",
          },
        },
      },
    },

    labels,
  };

  return (
    <div>
      <ReactApexChart options={options} series={series} type="radialBar" />
    </div>
  );
}

export default SemiCircleGaugeChart;
