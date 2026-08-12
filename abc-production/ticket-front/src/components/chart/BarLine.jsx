import React, { useRef } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
} from "chart.js";
import { Chart, getElementAtEvent } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import { filterIssues } from "../../store/Slice/statisticsSlice";
import ErrorImage from './../elements/ErrorImage';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
);

function BarLine() {
  const dispatch = useDispatch();
  const {
    statistics: { most_issuetypes },
    error,
    loading,
  } = useSelector((state) => {
    return state.statistics;
  });

  const labels = most_issuetypes.map((el) => el.issuetype);
  const countData = most_issuetypes.map((el) => el.count);
  const percentData = most_issuetypes.map((el) => el.percent);

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
      percentTagAxis: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        min: 0,
        max: 100,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "count",
        data: countData,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        type: "line",
        label: "percent",
        data: percentData,
        borderColor: "#5bc0de",
        borderWidth: 4,
        fill: false,
        yAxisId: "percentTagAxis",
      },
    ],
  };

  const chartRef = useRef();

  const printElementAtEvent = (element) => {
    if (!element.length) return;
    const { index } = element[0];
    return data.labels[index];
  };

  const onClick = (event) => {
    const { current: chart } = chartRef;
    if (!chart) {
      return;
    }
    const issuetype = printElementAtEvent(getElementAtEvent(chart, event));
    dispatch(filterIssues(issuetype));
  };
  if (loading) {
    return (
      <div className="w-100 h-100 center">
        <Spinner />
      </div>
    );
  } else if (error) {
    return <ErrorImage image="/server-error.svg"  text={error} />
  } else {
    return (
      <Chart
        ref={chartRef}
        onClick={onClick}
        type="bar"
        data={data}
        options={options}
      />
    );
  }

}

export default BarLine;
