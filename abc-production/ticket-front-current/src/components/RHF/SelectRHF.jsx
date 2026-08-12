"use client";
import React from "react";
import { useController } from "react-hook-form";
import { t } from "i18next";
import FormControl from "../ui/FormControl";
import { selectTheme } from "../../utils/them";
import Select from "react-select";

function SelectRHF({
  label,
  name,
  control,
  options = [],
  isMulti,
  ...restProps
}) {
  const {
    field: { onChange, value, ...field },
    fieldState: { invalid, error },
  } = useController({ name, control });


  return (
    <FormControl
      label={label}
      invalid={invalid}
      message={error && error.message}
    >
      <Select
        options={options}
        value={value ? options.find((option) => option.value === value) : value}
        onChange={(option) => onChange(option?.value ? option.value : "")}
        className="react-select-container"
        classNamePrefix="react-select"
        theme={(theme) => selectTheme(theme, invalid)}
        formatOptionLabel={(option) => t(option.label)}
        isClearable
        classNames={{
          placeholder: () => "text-base !text-gray-400 capitalize",
        }}
        {...field}
        {...restProps}
      />
    </FormControl>
  );
}
export default SelectRHF;
