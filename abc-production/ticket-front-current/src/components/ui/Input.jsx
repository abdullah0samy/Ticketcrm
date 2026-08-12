import { cva } from "class-variance-authority";
import React, { forwardRef } from "react";
import { cn } from "../../utils/helper";
import PropTypes from "prop-types"; // ES6

const Input = forwardRef((props, ref) => {
  const { className, invalid, radius, size,as, ...restProps } =
    props;

  const variants = cva(
    [
      "block w-full outline-0 resize-none	placeholder:capitalize",
      "border border-gray-300",
      "focus:border-primary-400 focus:ring focus:ring-primary-300 focus:ring-opacity-50",
      "disabled:bg-neutral-100 disabled:opacity-50",
    ],
    {
      variants: {
        invalid: {
          true: "border-red-300 focus:border-red-400 focus:ring focus:ring-red-300 focus:ring-opacity-50",
        },
        radius: {
          none: "rounded-none",
          sm: "rounded-sm",
          md: "rounded-md",
          lg: "rounded-lg",
          full: "rounded-full",
        },
        size: {
          sm: "py-1.5 px-2 text-sm",
          md: "py-2 px-2.5 text-[15px]",
          lg: "py-2.5 px-3 text-[17px]",
        },
      },
      defaultVariants: {
        radius: "md",
        size: "md",
      },
    }
  );

  const Comp = as || "input";

  return (
    <Comp
      className={cn(variants({ radius, size, invalid }), className)}
      ref={ref}
      {...restProps}
      
    />
  );
});

Input.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  invalid: PropTypes.bool,
  classNames: PropTypes.string,
  size: PropTypes.string,
  radius: PropTypes.string,
};

export default Input;
