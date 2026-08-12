import React from "react";
import { t } from "i18next";
import AdminCrudPage from "../../components/admin/AdminCrudPage";

export default function DepartmentsPage() {

  return (
    <AdminCrudPage
      title={t("departments")}
      endpoint="/catalog/departments/"
      columns={[
    { key: "name", label: t("name") },
    { key: "sla_hours", label: t("SLA hours") },
    { key: "users_count", label: t("users") },
    { key: "reciever", label: t("receives tickets") },
  ]}
      fields={[
    { name: "name", label: t("name"), required: true },
    { name: "sla_hours", label: t("SLA hours"), type: "number" },
    { name: "discribtion", label: t("description") },
    { name: "reciever", label: t("receives tickets"), type: "switch" },
  ]}
    />
  );
}
