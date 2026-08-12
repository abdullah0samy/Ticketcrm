import React, { useEffect } from "react";
import { t } from "i18next";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { getSurveyById } from "../../redux/actions/surveyActions";
import HandleError from "../../components/common/HandleError";
import { useParams } from "react-router-dom";
import SurveyInfoCard from "../../components/cards/SurveyInfoCard";
import SurveyAnswersCard from "../../components/cards/SurveyAnswersCard";

function SurveyProfilePage() {
  const dispatch = useDispatch();
  const { surveyById } = useParams();

  const { results, isLoading, error } = useSelector(
    (state) => state.surveys.surveyDetails
  );

  useEffect(() => {
    dispatch(getSurveyById(surveyById));
  }, [dispatch, surveyById]);

  return (
    <div className="py-4">
      <div className="mb-4">
        <h2 className="text-2xl capitalize font-medium">
          {t("view existing survey")}
        </h2>
        <Breadcrumbs size="lg">
          <BreadcrumbItem href="/">{t("home")}</BreadcrumbItem>
          <BreadcrumbItem href="/view">{t("view")}</BreadcrumbItem>
          <BreadcrumbItem>{t("profile")}</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <HandleError isLoading={isLoading} error={error} isEmpty={false}>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 ">
            <SurveyInfoCard
              surveyInfo={results.info}
              comment={results.comment}
            />
          </div>
          <div className="col-span-12">
            <SurveyAnswersCard surveyAnswers={results.answers} />
          </div>
        </div>
      </HandleError>
    </div>
  );
}

export default SurveyProfilePage;
