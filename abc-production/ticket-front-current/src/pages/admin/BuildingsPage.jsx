import React from "react";
import { t } from "i18next";
import AdminCrudPage from "../../components/admin/AdminCrudPage";

export default function BuildingsPage() {

  return (
    <AdminCrudPage
      title={t("buildings")}
      endpoint="/catalog/buildings/"
      columns={[
    { key: "name_ar", label: t("name (Arabic)") },
    { key: "name_en", label: t("name (English)") },
    { key: "code", label: t("code") },
    { key: "floors_count", label: t("floors") },
    { key: "is_active", label: t("status") },
  ]}
      fields={[
    { name: "name_ar", label: t("name (Arabic)"), required: true },
    { name: "name_en", label: t("name (English)"), required: true },
    { name: "code", label: t("code"), required: true },
    { name: "is_active", label: t("active"), type: "switch" },
  ]}
    />
  );
}
