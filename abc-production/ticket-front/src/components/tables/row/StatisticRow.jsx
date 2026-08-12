import { t } from "i18next";
import React from "react";
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { filterIssues } from "../../../store/Slice/statisticsSlice";

function StatisticRow({ statisticsData }) {
  const { issuetype, count, percent } = statisticsData;
  const dispatch = useDispatch();
  return (
    <tr>
      <td>{issuetype}</td>
      <td>{count}</td>
      <td>{percent}%</td>
      <td style={{ width: "150px" }}>
        <Button
          variant="dark"
          size="sm"
          onClick={() => dispatch(filterIssues(issuetype))}
        >
          {t("previwe")}
        </Button>
      </td>
    </tr>
  );
}

export default StatisticRow;
