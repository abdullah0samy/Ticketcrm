import { cva } from "class-variance-authority";
import React, { Children, cloneElement } from "react";
import { HiCheck } from "react-icons/hi";
import { cn } from "../../utils/helper";

export function Steps({ activeStep, children }) {
  const cloneElements = Children.map(children, (child, idx) => {
    return cloneElement(child, {
      index: idx + 1,
      isActive: activeStep === idx + 1,
      isChecked: activeStep > idx + 1,
    });
  });

  return <ol className="flex items-center w-full py-3">{cloneElements}</ol>;
}

export function Step(props) {
  const {
    isError,
    isActive,
    isChecked,
    index,
    children,
    className,
    ...restProps
  } = props;

  const variantsBase = cva(
    [
      "flex w-full overflow-hidden text-gray-500 relative",
      "after:content-['']  after:h-1 after:border-b after:border-2 after:w-full",
      "after:absolute after:start-10 after:top-5",
    ],
    {
      variants: {
        isError: {
          true: "after:border-red-500 text-red-500",
        },
        isChecked: {
          true: "after:border-primary text-primary",
        },
        isActive: {
          true: "after:border-primary-200 text-primary",
        },
      },
    }
  );

  const variantsDote = cva(
    [
      "box-center w-10 h-10 border-2 text-gray-500 rounded-full  shrink-0",
    ],
    {
      variants: {
        isError: {
          true: "bg-red-200",
        },
        isChecked: {
          true: "bg-primary border-primary text-white",
        },
        isActive: {
          true: "bg-primary-200 border-primary-200 text-primary-900",
        },
      },
    }
  );

  return (
    <li
      className={cn(variantsBase({ isError, isActive, isChecked }))}
      {...restProps}
    >
      <div className="flex flex-col gap-1">
        <span className={cn(variantsDote({ isError, isActive, isChecked }))}>
          {isChecked ? <HiCheck className="text-xl" /> : null}
          {!isChecked ? index : null}
        </span>
        <p className="text-center">{children}</p>
      </div>
    </li>
  );
}

export function StepContent({ activeStep, children }) {
  const stepsContentArray = React.Children.toArray(children);

  return <div>{stepsContentArray[activeStep - 1]}</div>;
}
