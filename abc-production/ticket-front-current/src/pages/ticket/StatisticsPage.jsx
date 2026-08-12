import React, { useEffect, useState } from "react";
import PieChart from "../../components/charts/PieChart";
import DonutChart from "../../components/charts/DonutChart";
import BarLineChart from "../../components/charts/BarLineChart";
import { t } from "i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  getSummary,
  getTicketStatistic,
} from "../../redux/actions/summaryActions";
import HandleError from "../../components/common/HandleError";
import IssuesTable from "../../components/tables/IssuesTable";
import ReactDatePicker from "react-datepicker";
import useParamsQuery from "../../hooks/useParamsQuery";
import moment from "moment";
import { HiOutlineXCircle } from "react-icons/hi";
import Input from "../../components/ui/Input";
import GaugeChart from "../../components/charts/GaugeChart";
import CanView from "../../components/common/CanView";
import Select from "react-select";
import useGetOptions from "../../hooks/useGetOptions";
import { Card } from "@nextui-org/react";
import { RxTimer } from "react-icons/rx";
import { mappingStatusValue } from "../../utils/selectOptions";
import { toast } from "sonner";
const { red, orange, green, blue } = require("tailwindcss/colors");

export default function StatisticsPage() {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState([null, null]);
  const { params, addParam, deleteParam } = useParamsQuery();
  const selectDepart = useGetOptions(
    "/users/router/department/select/?reciever=true"
  );
  const { data, isLoading, error } = useSelector((state) => state.summary);
  const { most_departments, tickets, most_issuetypes } = data;

  useEffect(() => {
    dispatch(getSummary(params));
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

  const handleGetTicketStatistic = async (key, value) => {
    try {
      await dispatch(
        getTicketStatistic({
          created_at: params.created_at,
          [key]: value,
        })
      ).unwrap();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="relative inline-flex items-center my-4">
          <ReactDatePicker
            placeholderText={
              params?.created_at ? params.created_at : t("select date")
            }
            customInput={<Input className="pe-7 w-60" />}
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
            className="absolute p-1 rounded-full end-1 box-center hover:opacity-60"
            onClick={clearDate}
          >
            <HiOutlineXCircle className="w-5 h-5" />
          </button>
        </div>
        <CanView allowed={["administration"]}>
          <Select
            options={selectDepart.options}
            isLoading={selectDepart.isLoading}
            onMenuOpen={selectDepart.getOptions}
            placeholder={t("select department")}
            className="w-56 h-full"
            onChange={(option) => addParam({ department: option.value })}
          />
        </CanView>
      </div>

      <HandleError isLoading={isLoading} error={error} isEmpty={false}>
        <div className="grid gap-3 my-3 md:grid-cols-1 lg:grid-cols-4">
          <DonutChart
            title={t("top 10 departments sending tickets")}
            labels={most_departments.map((item) => item.department)}
            series={most_departments.map((item) => item.count)}
            onSelectData={(value) =>
              handleGetTicketStatistic("complaint_department", value)
            }
          />
          <PieChart
            title={t("ticket status")}
            labels={[
              t("on_hold"),
              t("in_progress"),
              t("complete"),
              t("closed"),
            ]}
            series={[
              tickets.on_hold,
              tickets.in_progress,
              tickets.complete,
              tickets.closed,
            ]}
            colors={[red[500], orange[500], blue[500], green[500]]}
            onSelectData={(value) =>
              handleGetTicketStatistic("status", mappingStatusValue[value])
            }
          />
          <GaugeChart title={t("total tickets")} series={tickets.all} />
          <Card radius="sm" shadow="sm">
            <h6 className="pt-3 text-base font-medium text-center">
              {t("AHT")}
            </h6>
            <div className="flex flex-col items-center justify-center h-full gap-2 p-3 overflow-hidden text-2xl font-bold box-center">
              {tickets.aht}
              <RxTimer className="text-[#FF9800] w-[90px] h-[90px]" />
            </div>
          </Card>
        </div>
        <div className="grid gap-3 my-3 md:grid-cols-1 lg:grid-cols-2">
          <BarLineChart
            title={t("most impact issue types")}
            labels={most_issuetypes.map((item) => item.issuetype)}
            seriesCount={most_issuetypes.map((item) => item.count)}
            seriesPercent={most_issuetypes.map((item) => item.percent)}
            onSelectData={(value) =>
              handleGetTicketStatistic("issuetype", value)
            }
            className="mb-3"
          />
          <PieChart
            title={t("ticket holding status")}
            labels={[t("external"), t("internal")]}
            series={[tickets.external_tickets, tickets.internal_tickets]}
            colors={["#40534C", "#D6BD98"]}
            onSelectData={(value) =>
              handleGetTicketStatistic("is_external", value === "external")
            }
          />
        </div>
        <IssuesTable />
      </HandleError>
    </>
  );
}
