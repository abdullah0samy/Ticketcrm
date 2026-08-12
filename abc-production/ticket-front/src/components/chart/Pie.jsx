import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import ErrorImage from "../elements/ErrorImage";
ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart() {
  const { statistics, error, loading } = useSelector((state) => {
    return state.statistics;
  });

  const {
    tickets: { complete, on_hold, in_progress },
  } = statistics;

  const data = {
    labels: ["on hold", "in progress", "completed"],
    datasets: [
      {
        label: "# of percent",
        data: [on_hold.percent, in_progress.percent, complete.percent],
        backgroundColor: ["#dc3545", "#ffc107", "#198754"],
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
    return <Pie data={data} />;
  }
}

export default PieChart;
