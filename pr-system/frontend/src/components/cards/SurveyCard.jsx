import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import React from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import Avatar from "../ui/Avatar";
import { t } from "i18next";
import { Link } from "react-router-dom";

function SurveyCard({ surveyData }) {
  const { patient, phone, room_no, admission_no } = surveyData.info;
  return (
    <Card shadow="sm" isPressable as={Link} to={`/view/${surveyData.id}`}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <Avatar fallback={<HiOutlineDocumentText className="text-xl" />} />
          <div className="leading-1 text-sm">
            <p className="font-bold">{patient}</p>
            <p>{phone}</p>
          </div>
        </div>
        <Chip>{surveyData.flag ? t("out patient") : t("in patient")}</Chip>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-1 capitalize text-sm">
          <p className="flex gap-x-1">
            <span className="font-medium">{t("medical number")}:</span>
            {room_no}
          </p>
          <p className="flex gap-x-1">
            <span className="font-medium">{t("admission number")}:</span>
            {admission_no}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

export default SurveyCard;
