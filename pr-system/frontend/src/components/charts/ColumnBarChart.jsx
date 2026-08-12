import { Card } from "@nextui-org/react";
import React from "react";
import ReactApexChart from "react-apexcharts";
import ChartTitle from "./ChartTitle";

function ColumnBarChart({
  categories = ["1", "2", "3", "4", "5"],
  title,
  series,
  height = 260,
  width = "100%",
  propsCard = {},
  ...restProps
}) {
  const options = {
    chart: {
      toolbar: { show: false },
      type: "bar",
      id: "column",
      width: "100%",
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: "top", // top, center, bottom
        },
      },
    },
    xaxis: {
      categories,
      position: "bottom",
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      position: "bottom",
    },
  };

  return (
    <Card radius="sm" shadow="sm" {...propsCard}>
      <div className="p-3">
        <ReactApexChart
          type="bar"
          height={height}
          width={width}
          options={options}
          series={series}
          {...restProps}
        />
      </div>
    </Card>
  );
}

export default ColumnBarChart;
