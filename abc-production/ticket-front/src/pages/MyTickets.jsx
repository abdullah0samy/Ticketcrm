import React from "react";
import { useSelector } from "react-redux";
import TicketFilter from "../components/layout/TicketFilter";
import MyTicketsTable from "./../components/tables/MyTicketsTable";
import Pagination from "./../components/elements/Pagination";
import { t } from "i18next";

function MyTickets() {
  const { next, previous, count } = useSelector((state) => state.tickets);
  return (
    <>
      <TicketFilter is_mine={false} />
      <div className="p-3 mt-3 card">
        <MyTicketsTable />
        <div className="mt-4 d-flex justify-content-between align-items-center">
          <p className="mb-0 fs-text">
            {t("total number")} {count}
          </p>
        </div>
        <Pagination next={next} previous={previous} />
      </div>
    </>
  );
}

export default MyTickets;
