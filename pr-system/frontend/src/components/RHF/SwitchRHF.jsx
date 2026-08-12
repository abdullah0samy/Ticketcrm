"use client";
import React from "react";
import { Switch } from "@nextui-org/switch";
import { useController } from "react-hook-form";

export default function SwitchRHF({ label, name, control, ...restProps }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div className="flex flex-col gap-2">
      <Switch name={name} {...field} {...restProps}>
        {label}
      </Switch>
      {error && <p className="text-red-500 text-small">{error.message}</p>}
    </div>
  );
}
