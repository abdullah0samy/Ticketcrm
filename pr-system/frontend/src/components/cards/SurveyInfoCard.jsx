import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { t } from "i18next";
import React from "react";

function SurveyInfoCard({ surveyInfo, comment, ...restProps }) {
  const { patient, doctor, phone, room_no, admission_no } = surveyInfo;
  return (
    <Card shadow="sm" {...restProps}>
      <CardHeader className=" pb-0">
        <h5 className="text-lg font-medium capitalize">
          {t("report information")}
        </h5>
      </CardHeader>
      <CardBody>
        <ul className="flex flex-col gap-y-1  text-[16px]">
          <li className="flex gap-1.5 capitalize">
            <strong>{t("doctor")}:</strong>
            <span>{doctor}</span>
          </li>
          <li className="flex gap-1.5 capitalize">
            <strong>{t("patient")}:</strong>
            <span>{patient}</span>
          </li>
          <li className="flex gap-1.5 capitalize">
            <strong>{t("phone")}:</strong>
            <span>{phone}</span>
          </li>
          <li className="flex gap-1.5 capitalize">
            <strong>{t("room number")}:</strong>
            <span>{room_no}</span>
          </li>
          <li className="flex gap-1.5 capitalize">
            <strong>{t("medical number")}:</strong>
            <span>{admission_no}</span>
          </li>
          <li className="flex gap-1.5 capitalize">
            <strong>{t("comment")}:</strong>
            <span>{comment}</span>
          </li>
        </ul>
      </CardBody>
    </Card>
  );
}

export default SurveyInfoCard;
