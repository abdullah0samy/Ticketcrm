/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { Form, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getTickets } from "../../store/Slice/ticketSlice";
import TicketRow from "./row/TicketRow";
import { t } from "i18next";
import ChatModal from "../Modal/ChatModal";
import TransferModal from "../Modal/TransferModal";
import HandelError from "../elements/HandelError";


function TicketsTable({ isCheck, setIsCheck }) {
  const dispatch = useDispatch();
  const [isCheckAll, setIsCheckAll] = useState(false);
  const tableRef = useRef(null);

  const { ticketsList, loading, error } = useSelector((state) => state.tickets);

  let [searchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);

  useEffect(() => {
    dispatch(getTickets(params));
    setIsCheck([]);
  }, [searchParams]);

  const handleSelectAll = (e) => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(ticketsList.map((li) => li.id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  const handleClick = (e) => {
    const { id, checked } = e.target;
    if (checked) {
      setIsCheck([...isCheck, +id]);
    } else {
      setIsCheck(isCheck.filter((item) => item !== +id));
    }
  };

  const ticketsMapping = ticketsList.map((ticket) => {
    return (
      <TicketRow
        ticketData={ticket}
        key={ticket.id}
        handleClick={handleClick}
        isChecked={isCheck}
      />
    );
  });




  return (
    <>
      <ChatModal />
      <TransferModal />
      <Table
        className="align-middle custom-table bg-white"
        hover
        responsive
        ref={tableRef}
      >
        <thead>
          <tr>
            <th className="py-3">#</th>
            <th className="py-3">
              <Form.Check
                type="checkbox"
                onChange={handleSelectAll}
                checked={ticketsList.length === isCheck.length}
              />
            </th>
            <th className="py-3 user">{t("user")}</th>
            <th className="py-3 building">{t("building")}</th>
            <th className="py-3 floor">{t("floor")}</th>
            <th className="py-3 extension">{t("extension")}</th>
            <th className="py-3 status">{t("status")}</th>
            <th className="py-3 issus">{t("issus type")}</th>
            <th className="py-3 date">{t("date")}</th>
            <th className="py-3 action">{t("action")}</th>
          </tr>
        </thead>
        <tbody>{ticketsMapping}</tbody>
      </Table>
      <HandelError loading={loading} error={error} dataList={ticketsList} />
    </>
  );
}

export default TicketsTable;
