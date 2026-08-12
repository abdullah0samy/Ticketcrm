import React from "react";
import GaugeChart from "react-gauge-chart";
import ErrorImage from "../elements/ErrorImage";
import { Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";

function Gauge() {
  const { statistics, error, loading } = useSelector((state) => {
    return state.statistics;
  });

  const {
    tickets: { all },
  } = statistics;

  if (loading) {
    return (
      <div className="w-100 h-100 center">
        <Spinner />
      </div>
    );
  } else if (error) {
    return <ErrorImage image="/server-error.svg" text={error} full />;
  } else {
    return (
      <GaugeChart
        formatTextValue={(value) => all.count}
        nrOfLevels={4}
        cornerRadius={3}
        percent={all.rate}
        textColor="#000"
        id="gauge-chart1"
      />
    );
  }
}

export default Gauge;
