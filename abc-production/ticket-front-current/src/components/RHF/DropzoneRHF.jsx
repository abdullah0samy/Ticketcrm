import React from "react";
import { useController } from "react-hook-form";
import Dropzone from "./../common/Dropzone";

export default function DropzoneRHF({ name, control, multiple, ...restProps }) {
  const {
    field: { onChange, restField },
  } = useController({ name, control });

  return (
    <Dropzone
      onChange={(e) => onChange(e.target.files)}
      {...restField}
      {...restProps}
    />
  );
}
