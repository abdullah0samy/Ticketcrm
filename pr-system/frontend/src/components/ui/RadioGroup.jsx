import React, { Children, cloneElement } from "react";
import { Root, Indicator, Item } from "@radix-ui/react-radio-group";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/helper";
import PropTypes from "prop-types"; // ES6

function RadioGroup(props) {
  const {
    classNames = {},
    orientation,
    label,
    invalid,
    children,
    ...restProps
  } = props;


  const variants = cva("flex gap-3", {
    variants: {
      orientation: {
        col: "flex-col",
        row: "flex-row",
      },
    },
    defaultVariants: {
      orientation: "col",
    },
  });
  const labelStyle = "text-base text-gray-600 mb-1 capitalize";


  const cloneElements = Children.map(children, (child, idx) => {
    return cloneElement(child, { invalid });
  });

  return (
    <div className={cn(classNames.base)}>
      <p className={cn(labelStyle, classNames.label)}>{label}</p>
      <Root
        className={cn(variants({ orientation }), classNames.root)}
        {...restProps}
      >
        {cloneElements}
      </Root>
    </div>
  );
}

function Radio(props) {
  const {
    className,
    isCustom,
    invalid,
    id = `id-${Math.random()}`,
    children,
    ...restProps
  } = props;

  const variants = cva(
    [
      "border-2  p-0.5",
      "w-5 h-5 transition-all rounded-full",
      "data-[state=checked]:border-primary data-[state=checked]:text-primary",
    ],
    {
      variants: {
        isCustom: {
          true: "w-fit h-fit p-2 border shadow-sm rounded",
        },
        invalid: {
          true: "border-red-500 text-red-500 data-[state=checked]:border-red-500 data-[state=checked]:text-red-500",
        },
      },
      defaultVariants: {
        isCustom: false,
      },
    }
  );

  if (isCustom) {
    return (
      <Item
        id={id}
        className={cn(variants({ isCustom, invalid }), className)}
        {...restProps}
      >
        {children}
      </Item>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5")}>
      <Item
        id={id}
        className={cn(variants({ invalid }), className)}
        {...restProps}
      >
        <Indicator
          className={cn(
            "w-full h-full block rounded-full",
            `${invalid ? "bg-red-500" : "bg-primary"}`
          )}
        />
      </Item>
      <label
        className={cn("cursor-pointer", `${invalid ? "text-red-500" : ""}`)}
        htmlFor={id}
      >
        {children}
      </label>
    </div>
  );
}

RadioGroup.propTypes = {
  onValueChange: PropTypes.func,
  orientation: PropTypes.string,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  defaultValue: PropTypes.string,
  classNames: PropTypes.shape({
    label: PropTypes.string,
    root: PropTypes.string,
    base: PropTypes.string,
  }),
};

Radio.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  isCustom: PropTypes.bool,
  classNames: PropTypes.shape({
    label: PropTypes.string,
    item: PropTypes.string,
    base: PropTypes.string,
  }),
};

export { RadioGroup, Radio };
