import React from "react";
import ErrorImage from "./ErrorImage";
import { Spinner } from "@nextui-org/react";
import { t } from "i18next";

export default function HandleError({
  isLoading,
  error,
  isEmpty,
  errorState,
  emptyState,
  children,
}) {
  // check is loading
  if (isLoading) {
    return <Spinner />;
  }

  // check error
  if (error) {
    return errorState ? (
      errorState
    ) : (
      <ErrorImage image="/image/server-error.svg" text={error} />
    );
  }
  // check is empty data
  if (isEmpty && !isLoading) {
    return emptyState ? (
      emptyState
    ) : (
      <ErrorImage
        image="/image/not_found.svg"
        text={t("we did not find any results")}
      />
    );
  }

  return children;
}
