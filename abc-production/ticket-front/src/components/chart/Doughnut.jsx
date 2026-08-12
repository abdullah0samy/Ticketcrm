import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import ErrorImage from "../elements/ErrorImage";
ChartJS.register(ArcElement, Tooltip, Legend);

function DoughnutChart() {
  const {
    statistics: { most_departments },
    loading,
    error,
  } = useSelector((state) => {
    return state.statistics;
  });

  const labels = most_departments.map((el) => el.department);
  const countData = most_departments.map((el) => el.count);
  
  const color = [
    "#6c757d",
    "#5bc0de",
    "#dc3545",
    "#212529",
    "#085bf7",
    "#ffc107",
    "#198754",
    "#f57e0e",
    "#ea16f1",
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        label: "# of count",
        data: countData,
        backgroundColor: color,
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="w-100 h-100 center">
        <Spinner />
      </div>
    );
  } else if (error) {
    return <ErrorImage image="/server-error.svg" text={error} full />;
  } else {
    return <Doughnut data={data} />;
  }
}

export default DoughnutChart;
