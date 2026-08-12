import React, { useEffect } from "react";
import TicketsReceivedTable from "../../components/tables/TicketsReceivedTable";
import { t } from "i18next";
import useParamsQuery from "../../hooks/useParamsQuery";
import { getTickets } from "../../redux/actions/ticketActions";
import { useDispatch } from "react-redux";
import { ticketActions } from "../../redux/slices/ticketsSlice";
import FilterTickets from "../../components/common/FilterTickets";

export default function TicketsReceivedPage() {
  const { params } = useParamsQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTickets({ me: false, ...params }));
  }, [dispatch, params]);

  useEffect(() => {
    return () => dispatch(ticketActions.restTickets());
  }, [dispatch]);

  return (
    <div className="py-4">
      <div className="page-header">
        <h1 className="page-title">{t("view received tickets")}</h1>
      </div>
      <FilterTickets />
      <TicketsReceivedTable />
    </div>
  );
}
