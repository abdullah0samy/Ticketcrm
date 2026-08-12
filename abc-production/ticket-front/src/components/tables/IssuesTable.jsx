import { t } from "i18next";
import React from "react";
import { Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import HandelError from "../elements/HandelError";
import IssuesTicketRow from "./row/IssuesTicketRow";

function IssuesTable() {
  const { issues } = useSelector((state) => {
    return state.statistics;
  });
  return (
    <>
      <Table className="align-middle custom-table bg-white" hover responsive>
        <thead>
          <tr>
            <th className="py-3">{t("user")}</th>
            <th className="py-3 Description">{t("Description")}</th>
            <th className="py-3">{t("building")}</th>
            <th className="py-3">{t("floor")}</th>
            <th className="py-3">{t("extension")}</th>
            <th className="py-3">{t("status")}</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((item) => {
            return <IssuesTicketRow {...item} key={Math.random()} />;
          })}
        </tbody>
      </Table>
      <HandelError loading={null} error={null} dataList={issues} />
    </>
  );
}

export default IssuesTable;
