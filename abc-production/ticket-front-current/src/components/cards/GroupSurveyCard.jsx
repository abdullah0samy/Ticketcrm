import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import RadialBarCharts from "../charts/RadialbarCharts";
import { t } from "i18next";

function GroupSurveyCard({ categoryData }) {
  return (
    <Card>
      <CardBody>
        <h3 className="text-xl text-center capitalize">
          {categoryData.category.split("_").join(" ")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <RadialBarCharts
            series={((categoryData.inpatient / 5) * 100)?.toFixed(2)}
            label={t("in patient")}
          />
          <RadialBarCharts
            series={((categoryData.outpatient / 5) * 100)?.toFixed(2)}
            label={t("out patient")}
          />
        </div>
      </CardBody>
    </Card>
  );
}

export default GroupSurveyCard;
