import React from "react";
import Chart from "react-apexcharts";
import { Card, CardBody } from "@nextui-org/react";
import ChartTitle from "./ChartTitle";

export default function BarLineChart({
  title,
  labels = [],
  seriesCount = [],
  seriesPercent = [],
  onSelectData,
  className,
}) {
  const options = {
    labels,
    chart: {
      toolbar: { show: false },
      height: 400,
      type: "line",
      events: {
        dataPointSelection: function (_, chartContext, config) {
          setTimeout(() => {
            onSelectData(
              chartContext.w.globals.categoryLabels[config.dataPointIndex]
            );
          }, 50);
        },
      },
    },
    stroke: {
      width: [0, 4],
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1],
    },
    xaxis: {
      type: "category",
    },
  };

  const series = [
    {
      name: "count",
      type: "column",
      data: seriesCount,
    },
    {
      name: "percent",
      type: "line",
      data: seriesPercent,
    },
  ];

  return (
    <Card className={className}>
      <CardBody className="">
        <ChartTitle>{title}</ChartTitle>
        <Chart type="line" height={400} options={options} series={series} />
      </CardBody>
    </Card>
  );
}
