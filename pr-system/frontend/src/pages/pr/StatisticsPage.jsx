import React, { useEffect, useState } from "react";
import ColumnBarChart from "./../../components/charts/ColumnBarChart";
import { t } from "i18next";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Card,
  CardBody,
  Input,
} from "@nextui-org/react";
import GroupSurveyCard from "../../components/cards/GroupSurveyCard";
import SemiCircleGaugeChart from "../../components/charts/SemiCircleGaugeChart";
import { useSelector, useDispatch } from "react-redux";
import { getPrDashboard } from "../../redux/slices/prDashboardSlice";
import HandleError from "../../components/common/HandleError";
import UnsatisfiedTable from "../../components/tables/UnsatisfiedTable";
import ReactDatePicker from "react-datepicker";
import useParamsQuery from "./../../hooks/useParamsQuery";
import moment from "moment";
import { HiOutlineXCircle } from "react-icons/hi";

function PrStatisticsPage() {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state) => state.prDashboard);
  const { counts = {}, categories = [], unsatisfied } = data;
  const [dateRange, setDateRange] = useState([null, null]);

  const { params, addParam, deleteParam } = useParamsQuery();

  useEffect(() => {
    dispatch(getPrDashboard(params));
  }, [dispatch, params]);

  const handleRangeDate = (date) => {
    setDateRange(date);
    if (date[1] !== null) {
      const startDate = moment(date[0]).format("DD-MM-YYYY");
      const endDate = moment(date[1]).format("DD-MM-YYYY");
      addParam({ created_at: `${startDate} ${endDate}` });
    }
  };

  const clearDate = () => {
    setDateRange([null, null]);
    deleteParam("created_at");
  };
  return (
    <div className="py-6">
      <div className="flex justify-between items-center">
        <div className="mb-4">
          <h2 className="text-2xl capitalize font-medium">
            {t("view statistics reports")}
          </h2>
          <Breadcrumbs size="lg">
            <BreadcrumbItem href="/">{t("home")}</BreadcrumbItem>
            <BreadcrumbItem>{t("statistics")}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="relative inline-flex items-center my-4">
          <ReactDatePicker
            placeholderText={
              params?.created_at ? params.created_at : t("select date")
            }
            customInput={<Input className="w-60" />}
            dateFormat="dd-MM-yyyy"
            selectsRange={true}
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            shouldCloseOnSelect={false}
            dropdownMode="select"
            onChange={handleRangeDate}
          />
          <button
            className="absolute end-2 p-1 box-center rounded-full hover:opacity-60"
            onClick={clearDate}
          >
            <HiOutlineXCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      <HandleError isLoading={isLoading} error={error}>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <Card className="mb-4">
              <CardBody>
                <SemiCircleGaugeChart
                  series={[counts?.overall_rate?.toFixed(2)]}
                  labels={[t("overall rate")]}
                />
                <ColumnBarChart
                  categories={[t("in patient"), t("out patient")]}
                  series={[
                    {
                      name: t("call"),
                      data: [counts.inpatient?.call, counts.outpatient?.call],
                    },
                    {
                      name: t("in person"),
                      data: [
                        counts.inpatient?.inperson,
                        counts.outpatient?.inperson,
                      ],
                    },
                  ]}
                />
              </CardBody>
            </Card>
          </div>
          <div className="col-span-12 md:col-span-6 mb-4">
            <UnsatisfiedTable rows={unsatisfied} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {categories.map((category) => {
            return <GroupSurveyCard categoryData={category} />;
          })}
        </div>
      </HandleError>
    </div>
  );
}

export default PrStatisticsPage;
