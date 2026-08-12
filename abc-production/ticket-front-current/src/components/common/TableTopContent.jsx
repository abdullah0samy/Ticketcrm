import React from "react";
import useParamsQuery from "../../hooks/useParamsQuery";
import { t } from "i18next";
import Select from "react-select";
import { size_options } from "../../utils/selectOptions";

function TableTopContent({ count, text }) {
  const { params, addParam } = useParamsQuery();

  return (
    <div className="p-3 flex flex-wrap items-center justify-between">
      <p className="text-gray-500 text-base">
        {t("total")} {count} {t("tickets")}
      </p>
      <Select
        options={size_options}
        defaultValue={size_options[0]}
        value={size_options.find((option) => option.value === params.size)}
        placeholder={t("size")}
        onChange={(option) => addParam({ size: option.value })}
        className="w-20"
      ></Select>
    </div>
  );
}

export default TableTopContent;
