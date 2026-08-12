"use client";
import React from "react";
import { Checkbox } from "@nextui-org/checkbox";
import { useController } from "react-hook-form";

export default function CkeckboxRHF({ label, name, control, ...restProps }) {
  const {
    field,
    fieldState: { invalid },
  } = useController({ name, control });

  return (
    <Checkbox
      name={name}
      isInvalid={invalid}
      classNames={{
        base:"mb-2 block",
        label:"capitalize"
      }}
      {...restProps}
      {...field}
    >
      {label}
    </Checkbox>
  );
}
