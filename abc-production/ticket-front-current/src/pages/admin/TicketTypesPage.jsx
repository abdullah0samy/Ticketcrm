import React from "react";
import { t } from "i18next";
import AdminCrudPage from "../../components/admin/AdminCrudPage";
import useDepartmentOptions from "../../hooks/useDepartmentOptions";

export default function TicketTypesPage() {
  const departments = useDepartmentOptions();

  return (
    <AdminCrudPage
      title={t("ticket types")}
      endpoint="/catalog/ticket-types/"
      columns={[
    { key: "name", label: t("name") },
    {
      key: "department",
      label: t("department"),
      render: (row) => row.department?.name || "—",
    },
  ]}
      fields={[
    { name: "name", label: t("name"), required: true },
    { name: "department", label: t("department"), type: "select", options: departments },
  ]}
    />
  );
}
