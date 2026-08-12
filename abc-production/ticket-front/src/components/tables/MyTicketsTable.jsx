/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { t } from "i18next";
import HandelError from "../elements/HandelError";
import MyTicketRow from "./row/MyTicketRow";
import { useSearchParams } from "react-router-dom";
import { getMyTickets } from "../../store/Slice/ticketSlice";
import ChatModal from "../Modal/ChatModal";

function MyTicketsTable() {
  const { ticketsList, loading, error } = useSelector((state) => state.tickets);

  const dispatch = useDispatch();
  let [searchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);

  useEffect(() => {
    dispatch(getMyTickets(params));
  }, [searchParams]);



  const ticketsMapping = ticketsList.map((ticket) => {
    return <MyTicketRow ticketData={ticket} key={ticket.id} />;
  });

  return (
    <>
      <ChatModal />
      <Table className="align-middle custom-table bg-white" hover responsive>
        <thead>
          <tr>
            <th className="py-3">#</th>
            <th className="py-3">{t("department")}</th>
            <th className="py-3">{t("building")}</th>
            <th className="py-3">{t("floor")}</th>
            <th className="py-3">{t("extension")}</th>
            <th className="py-3">{t("status")}</th>
            <th className="py-3">{t("issus type")}</th>
            <th className="py-3">{t("date")}</th>
            <th className="py-3">{t("action")}</th>
          </tr>
        </thead>
        <tbody>{ticketsMapping}</tbody>
      </Table>
      <HandelError loading={loading} error={error} dataList={ticketsList} />
    </>
  );
}

export default MyTicketsTable;
