import React from "react";
import ErrorImage from "./ErrorImage";
import { Spinner } from "@nextui-org/react";
import { t } from "i18next";
import { HiOutlineInbox } from "react-icons/hi";

/**
 * Loading / error / empty gate around a list.
 *
 * "Nothing here yet" is not an error, so it no longer borrows the 404
 * illustration — that artwork has a large "404" in it and made every empty
 * table look like a broken page.
 */
export default function HandleError({
  isLoading,
  error,
  isEmpty,
  errorState,
  emptyState,
  emptyText,
  children,
}) {
  if (isLoading) {
    return (
      <div className="py-16 box-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return errorState ? (
      errorState
    ) : (
      <ErrorImage image="/image/server-error.svg" text={error} />
    );
  }

  if (isEmpty) {
    if (emptyState) return emptyState;
    return (
      <div className="py-14 box-center text-center">
        <div className="max-w-sm">
          <span className="box-center w-14 h-14 mx-auto rounded-full bg-default-100 text-default-400">
            <HiOutlineInbox className="text-3xl" />
          </span>
          <h3 className="text-base font-medium mt-4">
            {emptyText || t("nothing here yet")}
          </h3>
          <p className="text-sm text-default-400 mt-1">
            {t("items will appear here once they are created")}
          </p>
        </div>
      </div>
    );
  }

  return children;
}
