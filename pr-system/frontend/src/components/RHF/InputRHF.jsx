import React from "react";
import { useController } from "react-hook-form";
import Input from "../ui/Input";
import FormControl from "../ui/FormControl";

function InputRHF({
  type = "text",
  label,
  name,
  control,
  required,
  ...restProps
}) {
  
  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control });

  return (
    <FormControl
      label={label}
      invalid={invalid}
      required={required}
      message={error && error.message}
    >
      <Input name={name} type={type} {...restProps} {...field} />
    </FormControl>
  );
}
export default InputRHF;
