import React from "react";
import ReactApexChart from "react-apexcharts";
import ChartTitle from "./ChartTitle";

function RadialBarCharts({ series = 10, label }) {
  const options = {
    chart: {
      toolbar: { show: false },
      height: 350,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          borderRadius: 10,
          size: "60%",
        },
      },
    },
    labels: [label],
  };

  return (
    <div>
      <ReactApexChart
        options={options}
        series={[series]}
        type="radialBar"
        height={350}
      />
    </div>
  );
}

export default RadialBarCharts;
