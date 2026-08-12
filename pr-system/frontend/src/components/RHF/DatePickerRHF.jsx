import React from "react";
import DatePicker from "react-datepicker";
import { useController } from "react-hook-form";
import Input from "../ui/Input";
import FormControl from "../ui/FormControl";

export default function DatePickerRHF({
  label,
  name,
  control,
  required,
  ...restProps
}) {
  const {
    field: { value, onChange, ...restField },
    fieldState: { invalid, error },
  } = useController({ name, control });

  return (
    <FormControl
      label={label}
      invalid={invalid}
      message={error && error.message}
      required
    >
      <DatePicker
        selected={value}
        onChange={(date) => onChange(date)}
        customInput={<Input invalid={invalid} />}
        {...restField}
        {...restProps}
      />
    </FormControl>
  );
}
