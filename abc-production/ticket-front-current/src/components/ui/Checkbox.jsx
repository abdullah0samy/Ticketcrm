import React, { forwardRef } from "react";
import { Root, Indicator } from "@radix-ui/react-checkbox";
import { cva } from "class-variance-authority";
import { HiCheck } from "react-icons/hi";
import { cn } from "../../utils/helper";

const Checkbox = forwardRef((props, ref) => {
  const {
    label,
    id = "check",
    classNames = {},
    size,
    radius,
    color,
    icon,
    ...restProps
  } = props;

  const variantsRoot = cva(
    `box-center border-2 bg-transparent text-white data-[disabled]:opacity-60 appearance-none transition-colors duration-200`,
    {
      variants: {
        color: {
          primary: "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
          secondary: "data-[state=checked]:bg-secondary",
          danger: "data-[state=checked]:bg-red-500",
          succsses: "data-[state=checked]:bg-green-500",
          warning: "data-[state=checked]:bg-yellow-500",
          dark: "data-[state=checked]:bg-gray-500",
        },
        size: {
          sm: "w-4 h-4",
          md: "w-5 h-5",
          lg: "w-6 h-6",
        },
        radius: {
          sm: "rounded-sm",
          md: "rounded-md",
          lg: "rounded-lg",
          full: "rounded-full",
        },
      },
      defaultVariants: {
        size: "md",
        radius: "md",
        color: "primary",
      },
    }
  );

  return (
    <div className={cn("inline-flex items-center gap-x-2", classNames.wrapper)}>
      <Root
        id={id}
        className={cn(variantsRoot({ size, radius, color }), classNames.root)}
        {...restProps}
      >
        <Indicator className="box-center">{icon || <HiCheck />}</Indicator>
      </Root>
      <label className={cn("cursor-pointer", classNames.label)} htmlFor={id}>
        {label}
      </label>
    </div>
  );
});

export default Checkbox;
