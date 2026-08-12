import React from "react";
import { Root, Trigger, Content, Portal } from "@radix-ui/react-popover";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/helper";

function Popover({ children, ...restProps }) {
  return <Root {...restProps}>{children}</Root>;
}

function PopoverTrigger({ children, ...restProps }) {
  return (
    <Trigger asChild {...restProps}>
      {children}
    </Trigger>
  );
}
function PopoverContent(props) {
  const {
    children,
    className,
    size,
    sideOffset = 5,
    alignOffset = 15,
    collisionPadding = 10,
    radius,
    ...restProps
  } = props;

  const styleBase = [
    "border outline-0 outline-gray-300",
    "bg-white shadow-md shadow-gray-500/10 z-50 p-2 animate-in duration-300",
    "data-[side=top]:slide-in-from-top-2",
    "data-[side=right]:slide-in-from-right-2",
    "data-[side=bottom]:slide-in-from-bottom-2",
    "data-[side=left]:slide-in-from-left-2",
  ];

  const variantsContent = cva(styleBase, {
    variants: {
      size: {
        sm: "max-w-[180px]",
        md: "max-w-[220px]",
        lg: "max-w-[300px]",
      },
      radius: {
        sm: "rounded-sm",
        md: "rounded-md",
        default: "rounded",
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
    },
    defaultVariants: {
      size: "md",
      radius: "default",
    },
  });

  return (
    <Portal>
      <Content
        className={cn(variantsContent({ size, radius }), className)}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        {...restProps}
      >
        {children}
      </Content>
    </Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
