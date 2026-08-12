import React from "react";
import { Chip } from "@nextui-org/react";
import { t } from "i18next";
import AdminCrudPage from "../../components/admin/AdminCrudPage";
import useDepartmentOptions from "../../hooks/useDepartmentOptions";

export default function AssetsPage() {
  const departments = useDepartmentOptions();

  return (
    <AdminCrudPage
      title={t("assets")}
      endpoint="/catalog/assets/"
      columns={[
    { key: "name", label: t("name") },
    { key: "serial_number", label: t("serial number") },
    { key: "asset_type", label: t("type") },
    { key: "location", label: t("location") },
    { key: "department_name", label: t("department") },
    {
      key: "status",
      label: t("status"),
      render: (row) => (
        <Chip
          size="sm"
          variant="flat"
          color={
            row.status === "active"
              ? "success"
              : row.status === "maintenance"
              ? "warning"
              : "default"
          }
        >
          {t(row.status)}
        </Chip>
      ),
    },
  ]}
      fields={[
    { name: "name", label: t("name"), required: true },
    { name: "serial_number", label: t("serial number") },
    { name: "asset_type", label: t("type"), required: true },
    { name: "location", label: t("location") },
    { name: "department", label: t("department"), type: "select", options: departments },
    {
      name: "status",
      label: t("status"),
      type: "select",
      options: [
        { value: "active", label: t("active") },
        { value: "maintenance", label: t("maintenance") },
        { value: "retired", label: t("retired") },
      ],
    },
    { name: "purchase_date", label: t("purchase date"), type: "date" },
    { name: "warranty_expiry", label: t("warranty expiry"), type: "date" },
  ]}
    />
  );
}
