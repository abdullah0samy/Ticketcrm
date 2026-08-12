import React from "react";
import Chart from "react-apexcharts";
import { Card } from "@nextui-org/react";
import ChartTitle from "./ChartTitle";

function DonutChart({
  title,
  labels,
  series,
  propsCard = {},
  onSelectData,
  height = 280,
}) {
  const options = {
    labels,
    chart: {
      toolbar: { show: false },
      type: "donut",
      events: {
        dataPointSelection: function (_, chartContext, config) {
          setTimeout(() => {
            onSelectData(chartContext.w.globals.labels[config.dataPointIndex]);
          }, 50);
        },
      },
    },
    legend: {
      position: "bottom",
    },
  };

  return (
    <Card radius="sm" shadow="sm" {...propsCard}>
      <div className="p-3 min-h-[360px]">
        <ChartTitle>{title}</ChartTitle>
        <Chart
          type="donut"
          width={"100%"}
          height={height}
          options={options}
          series={series}
        />
      </div>
    </Card>
  );
}
export default DonutChart;
