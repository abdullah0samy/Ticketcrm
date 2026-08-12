"use client";
import React from "react";
import { useController } from "react-hook-form";
import { t } from "i18next";
import FormControl from "../ui/FormControl";
import { selectTheme } from "../../utils/them";
import Select from "react-select";

function MultiSelectRHF({
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
        value={
          value ? options.filter((c) => value.includes(String(c.value))) : value
        }
        onChange={(option) =>
          onChange(option ? option.map((c) => String(c.value)) : option)
        }
        formatOptionLabel={(option) => t(option.label)}
        classNames={{
          placeholder: () => "text-base !text-gray-400 capitalize",
        }}
        theme={(theme) => selectTheme(theme, invalid)}
        menuPlacement="auto"
        className="react-select-container"
        classNamePrefix="react-select"
        isMulti
        {...field}
        {...restProps}
      />
    </FormControl>
  );
}
export default MultiSelectRHF;
