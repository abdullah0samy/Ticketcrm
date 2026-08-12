import React from "react";
import { Root, Indicator } from "@radix-ui/react-progress";
import { cn } from "../../utils/helper";

function Progress({ value,label, classNames = {}, ...respProps }) {
  return (
    <div className={cn(classNames.base)}>
      {label}
      <Root
        value={value}
        className={cn(
          "relative overflow-hidden bg-gray-300 rounded-full w-full h-3",
          classNames.root
        )}
        {...respProps}
      >
        <Indicator
          style={{ width: `${value}%` }}
          className={cn(
            "bg-primary w-full h-full rounded-full",
            classNames.indicator
          )}
        />
      </Root>
    </div>
  );
}

export default Progress;
