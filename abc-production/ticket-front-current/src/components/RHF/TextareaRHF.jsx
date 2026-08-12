"use client"
import { Textarea } from "@nextui-org/react";
import React from "react";
import { useController } from "react-hook-form";

export default function TextareaRHF({ label, name, control, ...restProps }) {
  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control });

  return (
    <Textarea
      label={label}
      name={name}
      isInvalid={invalid}
      errorMessage={error && error.message}
      variant="bordered"
      classNames={{
        base:"mb-2",
        label: "capitalize rtl:origin-top-right",
        trigger:"border-1 border-gray-300"
      }}
      {...restProps}
      {...field}
    />
  );
}
