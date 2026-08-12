import React from "react";
import DatePicker from "react-datepicker";
import { useController } from "react-hook-form";
import FormControl from "../ui/FormControl";
import Input from "../ui/Input";

function RangeDatePickerRHF({ label, name, control, ...restProps }) {
  const {
    field: { value, onChange, ...restField },
    fieldState: { invalid, error },
  } = useController({ name, control });

  const handleChange = (date) => {
    onChange(date);
  };

  return (
    <FormControl
      label={label}
      invalid={invalid}
      message={error && error.message}
    >
      <DatePicker
        onChange={handleChange}
        startDate={value[0]}
        endDate={value[1]}
        selectsRange
        showMonthDropdown
        showYearDropdown
        shouldCloseOnSelect={false}
        dropdownMode="select"
        customInput={<Input invalid={invalid}  />}
        {...restField}
        {...restProps}
      />
    </FormControl>
  );
}
export default RangeDatePickerRHF;
