import React, { useEffect } from "react";
import ArchivedTicketsTable from "../../components/tables/ArchivedTicketsTable";
import { t } from "i18next";
import { useDispatch } from "react-redux";
import useParamsQuery from "../../hooks/useParamsQuery";
import { getArchives } from "../../redux/actions/archiveActions";
import { restArchives } from "../../redux/slices/archiveSlice";

export default function ArchivedTicketsPage() {
  const dispatch = useDispatch();
  const { params } = useParamsQuery();

  useEffect(() => {
    dispatch(getArchives(params));
  }, [dispatch, params]);

  // clean up state
  useEffect(() => {
    return () => dispatch(restArchives());
  }, [dispatch]);

  return (
    <div className="py-4">
      <div className="page-header">
        <h1 className="page-title">{t("view archived tickets")}</h1>
      </div>
      <ArchivedTicketsTable />
    </div>
  );
}
