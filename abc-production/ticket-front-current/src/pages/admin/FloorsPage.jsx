import React, { useEffect, useState } from "react";
import axios from "axios";
import { t } from "i18next";
import AdminCrudPage from "../../components/admin/AdminCrudPage";

export default function FloorsPage() {
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/catalog/buildings/")
      .then((res) => {
        if (cancelled) return;
        const rows = res?.results ?? res ?? [];
        setBuildings(rows.map((b) => ({ value: b.id, label: b.name_en })));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminCrudPage
      title={t("floors")}
      endpoint="/catalog/floors/"
      columns={[
        { key: "name_ar", label: t("name (Arabic)") },
        { key: "name_en", label: t("name (English)") },
        { key: "building_name", label: t("building") },
        { key: "code", label: t("code") },
        { key: "is_active", label: t("status") },
      ]}
      fields={[
        { name: "building", label: t("building"), type: "select", options: buildings, required: true },
        { name: "name_ar", label: t("name (Arabic)"), required: true },
        { name: "name_en", label: t("name (English)"), required: true },
        { name: "code", label: t("code"), required: true },
        { name: "is_active", label: t("active"), type: "switch" },
      ]}
    />
  );
}
