import React from "react";
import { cn } from "../../utils/helper";

function HelperText({ className, invalid, children }) {
  const styleState = invalid ? "text-red-500" : "text-gray-500";
  return <p className={cn("text-sm mt-1 leading-none", className, styleState)}>{children}</p>;
}

export default HelperText;
