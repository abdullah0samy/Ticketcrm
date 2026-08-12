import { cn } from "@nextui-org/react";

export function List({ className, children, restProps }) {
  return (
    <ul className={cn("flex flex-col divide-y", className)} {...restProps}>
      {children}
    </ul>
  );
}

export function ListItem({ label, value, className, restProps }) {
  return (
    <li
      className={cn("text-sm flex justify-between py-2", className?.base)}
      {...restProps}
    >
      <strong className={cn("capitalize", className?.label)}>{label}</strong>
      <span className={cn(className?.value)}>{value}</span>
    </li>
  );
}
