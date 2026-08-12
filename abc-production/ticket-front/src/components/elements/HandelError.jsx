import React from "react";
import { Spinner } from "react-bootstrap";
import ErrorImage from "./ErrorImage";
import { t } from "i18next";

function HandelError({ loading, error, dataList }) {
  if (loading) {
    return <Spinner nimation="border" role="status" />;
  } else if (error) {
    return <ErrorImage image="/server-error.svg" text={error} />;
  } else if (dataList.length === 0 && !loading) {
    return <ErrorImage image="/empty.svg" text={t("not result")} />;
  }
}

export default HandelError;
