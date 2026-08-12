import React from "react";
import { Chip } from "@nextui-org/react";
import { t } from "i18next";
import AdminCrudPage from "../../components/admin/AdminCrudPage";
import useDepartmentOptions from "../../hooks/useDepartmentOptions";

export default function UsersPage() {
  const departments = useDepartmentOptions();

  return (
    <AdminCrudPage
      title={t("user management")}
      endpoint="/catalog/users/"
      titleKey="full_name"
      columns={[
    { key: "fingerid", label: t("finger ID") },
    { key: "full_name", label: t("name") },
    { key: "department_name", label: t("department") },
    {
      key: "role",
      label: t("role"),
      render: (row) => (
        <Chip size="sm" variant="flat">
          {t(row.role)}
        </Chip>
      ),
    },
    { key: "is_active", label: t("status") },
  ]}
      fields={[
    { name: "fingerid", label: t("finger ID"), type: "number", required: true },
    { name: "first_name", label: t("first name"), required: true },
    { name: "last_name", label: t("last name") },
    { name: "department", label: t("department"), type: "select", options: departments },
    { name: "password", label: t("password"), type: "password" },
    { name: "is_active", label: t("active"), type: "switch" },
    { name: "is_superuser", label: t("manager"), type: "switch" },
  ]}
    />
  );
}
