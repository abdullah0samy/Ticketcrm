import React, { useEffect } from "react";
import SurveyCard from "../../components/cards/SurveyCard";
import { t } from "i18next";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { getMoreSurveys, getSurveys } from "../../redux/actions/surveyActions";
import HandleError from "../../components/common/HandleError";
import useParamsQuery from "./../../hooks/useParamsQuery";
import LoadMoreData from "./../../components/common/LoadMoreData";

function SurveysPrPage() {
  const dispatch = useDispatch();
  const { params } = useParamsQuery();
  const {
    data: { results, next },
    isLoading,
    error,
  } = useSelector((state) => state.surveys);

  useEffect(() => {
    dispatch(getSurveys(params));
  }, [dispatch, params]);

  const surveysMapping = results.map((survey) => {
    return <SurveyCard surveyData={survey} key={survey.id} />;
  });

  return (
    <div className="py-4">
      <div className="mb-4">
        <h2 className="text-2xl capitalize font-medium">{t("view surveys")}</h2>
        <Breadcrumbs size="lg">
          <BreadcrumbItem href="/">{t("home")}</BreadcrumbItem>
          <BreadcrumbItem>{t("view")}</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <HandleError
        isLoading={isLoading}
        error={error}
        isEmpty={!results.length}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ">
          {surveysMapping}
        </div>
        <LoadMoreData next={next} dispatchFn={() => getMoreSurveys(next)} />
      </HandleError>
    </div>
  );
}

export default SurveysPrPage;
