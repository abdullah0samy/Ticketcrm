import React, { Children, cloneElement } from "react";
import { cn } from "../../utils/helper";
import Label from "./Label";
import HelperText from "./HelperText";

function FormControl(props) {
  const { className, label, required, invalid, message, children } = props;
  const controlElement = Children.map(children, (child) => {
    return cloneElement(child, { invalid });
  });
  return (
    <div className={cn("relative block mb-3", className)}>
      {label ? <Label required={required}>{label}</Label> : null}
      {controlElement}
      {message ? <HelperText invalid={invalid}>{message}</HelperText> : null}
    </div>
  );
}

export default FormControl;
