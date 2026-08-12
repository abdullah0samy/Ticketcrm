import { t } from "i18next";
import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(cx(...inputs));
}

export const columnStyle = (style) => {
  return cn("text-small capitalize", style);
};

/**
 * A person's display name.
 *
 * History rows keep a null `history_user` once the account that made the change
 * is deleted, and system-generated entries never had one. Destructuring that
 * null threw and took the whole History tab down instead of showing "unknown"
 * for the one row.
 *
 * Note this cannot be written as a defaulted parameter: a default only applies
 * to `undefined`, so `getFullName(null)` would still throw.
 */
export const getFullName = (user) => {
  const { first_name, last_name } = user || {};
  const name = [first_name, last_name].filter(Boolean).join(" ").trim();
  return name || t("unknown");
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
