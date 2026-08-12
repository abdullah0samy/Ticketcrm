import { t } from "i18next";
import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(cx(...inputs));
}

export const columnStyle = (style) => {
  return cn("text-small capitalize", style);
};

export const getFullName = ({ first_name, last_name }) => {
  if (first_name || last_name) return `${first_name} ${last_name}`;
  return t("unknown");
};

export const checkValue = (value) => {
  if (value) return value;
  return t("unknown");
};
// filter empty keys of object
export function filterNullValue(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => value)
  );
}

export function getArrayFromText(value) {
  if (!value) return [];
  return value.split(",");
}
