import React, { useEffect } from "react";
import { Form, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getStatistics } from "../../store/Slice/statisticsSlice";
import StatisticRow from "./row/StatisticRow";
import HandelError from "./../elements/HandelError";
import { t } from "i18next";

function StatisticsTable() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getStatistics(1));
  }, [dispatch]);

  const handelSummary = (e) => {
    dispatch(getStatistics(e.target.value));
  };

  const {
    statistics: { most_tickets },
    error,
    loading,
  } = useSelector((state) => {
    return state.statistics;
  });

  const ticketsMapping = most_tickets.map((ticket) => {
    return <StatisticRow statisticsData={ticket} key={ticket.id} />;
  });

  return (
    <>
      <div className="border-bottom p-2">
        <Form.Group style={{ width: "200px" }}>
          <Form.Select name="summary" onChange={handelSummary}>
            <option value="1">{t("day")}</option>
            <option value="30">{t("month")}</option>
            <option value="365">{t("year")}</option>
          </Form.Select>
        </Form.Group>
      </div>
      <Table className="align-middle custom-table bg-white" hover responsive>
        <thead>
          <tr>
            <th className="py-3">{t("issus type")}</th>
            <th className="py-3">{t("issue count")}</th>
            <th className="py-3">{t("percent")}</th>
            <th className="py-3">{t("previwe")}</th>
          </tr>
        </thead>
        <tbody>{ticketsMapping}</tbody>
      </Table>

      <HandelError loading={loading} error={error} dataList={most_tickets} />
    </>
  );
}

export default StatisticsTable;
