import { Card } from "@nextui-org/react";
import React from "react";
import Gauge from "react-gauge-chart";

function GaugeChart({ series, title, propsCard = {} }) {
  return (
    <Card radius="sm" shadow="sm" {...propsCard}>
      <h6 className="pt-3 text-base font-medium text-center">{title}</h6>
      <div className="h-full p-3 box-center">
        <Gauge
          formatTextValue={(value) => series.count}
          nrOfLevels={4}
          cornerRadius={3}
          percent={series.rate}
          textColor="#000"
          id="gauge-chart1"
          className="box-center"
        />
      </div>
    </Card>
  );
}

export default GaugeChart;
