import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { t } from "i18next";
import React from "react";
import { Radio, RadioGroup } from "../ui/RadioGroup";
import {
  FaRegFaceFrown,
  FaRegFaceFrownOpen,
  FaRegFaceGrin,
  FaRegFaceGrinBeam,
  FaRegFaceGrinHearts,
} from "react-icons/fa6";

function SurveyAnswersCard({ surveyAnswers = [], ...restProps }) {
  return (
    <Card shadow="sm" {...restProps}>
      <CardHeader className=" pb-0">
        <h5 className="text-lg font-medium capitalize">
          {t("patient answers")}
        </h5>
      </CardHeader>
      <CardBody>
        {surveyAnswers.map((answer) => {
          return (
            <RadioGroup
              orientation="row"
              label={answer.question}
              defaultValue={answer.answer}
              classNames={{
                label: "text-gray-600 capitalize font-medium text-lg mb-1",
                base: "mb-3",
              }}
            >
              {answer.group === "rate" ? (
                <>
                  <Radio
                    className={"flex flex-col items-center text-sm px-4"}
                    value={1}
                    isCustom
                    disabled
                  >
                    <FaRegFaceFrown className="text-2xl" />
                    {t("extremely unsatisfied")}
                  </Radio>
                  <Radio
                    className={"flex flex-col items-center text-sm px-4"}
                    value={2}
                    isCustom
                    disabled
                  >
                    <FaRegFaceFrownOpen className="text-2xl" />
                    {t("unsatisfied")}
                  </Radio>
                  <Radio
                    className={"flex flex-col items-center text-sm px-4"}
                    value={3}
                    isCustom
                    disabled
                  >
                    <FaRegFaceGrin className="text-2xl" />
                    {t("normal")}
                  </Radio>
                  <Radio
                    className={"flex flex-col items-center text-sm px-4"}
                    value={4}
                    isCustom
                    disabled
                  >
                    <FaRegFaceGrinBeam className="text-2xl" />
                    {t("satisfied")}
                  </Radio>
                  <Radio
                    className={"flex flex-col items-center text-sm px-4"}
                    value={5}
                    isCustom
                    disabled
                  >
                    <FaRegFaceGrinHearts className="text-2xl" />
                    {t("extremely satisfied")}
                  </Radio>
                </>
              ) : (
                <>
                  <Radio isCustom disabled value={1}>
                    {t("yes")}
                  </Radio>
                  <Radio isCustom disabled value={0}>
                    {t("no")}
                  </Radio>
                </>
              )}
            </RadioGroup>
          );
        })}
      </CardBody>
    </Card>
  );
}

export default SurveyAnswersCard;
