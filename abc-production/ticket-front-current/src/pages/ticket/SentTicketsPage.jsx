import React, { useEffect } from "react";
import SentTicketsTable from "../../components/tables/SentTicketsTable";
import { t } from "i18next";
import { useDispatch } from "react-redux";
import useParamsQuery from "../../hooks/useParamsQuery";
import { getTickets } from "../../redux/actions/ticketActions";
import { ticketActions } from "../../redux/slices/ticketsSlice";
import FilterTickets from "../../components/common/FilterTickets";

export default function SentTicketsPage() {
  const dispatch = useDispatch();
  const { params } = useParamsQuery();

  useEffect(() => {
    dispatch(getTickets({ ...params, me: true }));
  }, [dispatch, params]);

  useEffect(() => {
    return () => dispatch(ticketActions.restTickets());
  }, [dispatch]);

  return (
    <div className="py-4">
      <div className="page-header">
        <h1 className="page-title">{t("view sent tickets")}</h1>
      </div>
      <FilterTickets />
      <SentTicketsTable />
    </div>
  );
}
