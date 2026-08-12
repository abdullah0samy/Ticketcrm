import React, { forwardRef } from "react";
import { Root, Image, Fallback } from "@radix-ui/react-avatar";
import { cn } from "../../utils/helper";
import { cva } from "class-variance-authority";
import PropTypes from "prop-types"; // ES6

const Avatar = forwardRef((props, ref) => {
  const {
    size,
    radius,
    color,
    classNames = {},
    className,
    src,
    alt,
    fallback,
    as,
    ...restProps
  } = props;

  const variantsRoot = cva(
    `center-box box-center flex-shrink-0 overflow-hidden align-middle `,
    {
      variants: {
        color: {
          primary: "bg-primary",
          secondary: "bg-secondary",
          danger: "bg-red-500",
          succsses: "bg-green-500",
          warning: "bg-yellow-500",
          dark: "bg-gray-500",
        },
        size: {
          xs: "w-6 h-6",
          sm: "w-8 h-8",
          md: "w-10 h-10",
          lg: "w-14 h-14 text-4xl",
          xl: "w-20 h-20 text-5xl",
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
        radius: "full",
        color: "primary",
      },
    }
  );

  const Comp = as || "div";

  return (
    <Root
      asChild
      ref={ref}
      className={cn(
        variantsRoot({ size, radius, color }),
        classNames.root,
        className
      )}
      {...restProps}
    >
      <Comp>
        <Image
          className={cn(
            "h-full w-full rounded-[inherit] object-cover",
            classNames.image
          )}
          src={src}
          alt={alt}
        />
        <Fallback
          className={cn(
            "text-white leading-1 flex h-full w-full box-center",
            classNames.fallback
          )}
          delayMs={600}
        >
          {fallback}
        </Fallback>
      </Comp>
    </Root>
  );
});

Avatar.propTypes = {
  fallback: PropTypes.element,
  size: PropTypes.string,
  radius: PropTypes.string,
  color: PropTypes.string,
  src: PropTypes.string,
  alt: PropTypes.string,
  classNames: PropTypes.shape({
    root: PropTypes.string,
    image: PropTypes.string,
    fallback: PropTypes.string,
  }),
};

export default Avatar;
