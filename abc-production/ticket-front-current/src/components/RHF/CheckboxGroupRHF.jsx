"use client";
import React from "react";
import {CheckboxGroup, Checkbox} from "@nextui-org/checkbox";
import { useController } from "react-hook-form";

export default function CheckboxGroupRHF(props) {
  const { label, name, control, options = [], ...restProps } = props;
  
  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control });

  return (
    <div className="flex flex-col gap-3 mb-2">
      <CheckboxGroup
        label={label}
        isInvalid={invalid}
        {...field}
        {...restProps}
      >
        {options.map((option) => {
            return <Checkbox key={option.label} value={option.value}>{option.label}</Checkbox>
        })}
      </CheckboxGroup>
      {error && <p className="text-red-500 text-small"> {error.message}</p>}
    </div>
  );
}
