import React from "react";
import { useController } from "react-hook-form";
import { RadioGroup } from "../ui/RadioGroup";

function RadioGroupRHF({ label, name, control, children, ...restProps }) {
  const {
    field: { onChange, ...field },
    fieldState: { invalid, error },
  } = useController({ name, control });

  return (
    <div className="mb-3">
      <RadioGroup
        label={label}
        invalid={invalid}
        onValueChange={(value) => {
          console.log(value);
          onChange(value)
        }}
        {...field}
        {...restProps}
      >
        {children}
      </RadioGroup>
      {error && <p className="text-red-500 text-small"> {error.message}</p>}
    </div>
  );
}

export default RadioGroupRHF;
