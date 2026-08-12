import { Card } from "@nextui-org/react";
import React from "react";
import Chart from "react-apexcharts";
import ChartTitle from "./ChartTitle";

function PieChart({
  title,
  labels,
  series,
  colors,
  propsCard = {},
  propsChart = {},
  onSelectData,
  height = 280,
}) {
  const options = {
    labels,
    chart: {
      toolbar: { show: false },
      type: "pie",
      events: {
        dataPointSelection: function (_, chartContext, config) {  
          setTimeout(() => {
            onSelectData(
              chartContext.w.globals.labels[config.dataPointIndex]
            );
          }, 50);
        },
      },
    },
    colors,
    legend: {
      position: "bottom",
    },
  };

  return (
    <Card radius="sm" shadow="sm" {...propsCard}>
      <div className="p-3 min-h-[360px]">
        <ChartTitle>{title}</ChartTitle>
        <Chart
          width={"100%"}
          height={height}
          options={options}
          series={series}
          type="pie"
          {...propsChart}
        />
      </div>
    </Card>
  );
}
export default PieChart;
