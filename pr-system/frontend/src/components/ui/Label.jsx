import React from "react";
import { cn } from "../../utils/helper";

function Label({ required, className, size, children, ...restProps }) {
  return (
    <label
      className={cn("flex gap-x-0.5 text-sm font-medium mb-1 capitalize", className)}
      {...restProps}
   
    >
      {children}
      {required ? <span className="text-red-500">*</span> : null}
    </label>
  );
}

export default Label;
