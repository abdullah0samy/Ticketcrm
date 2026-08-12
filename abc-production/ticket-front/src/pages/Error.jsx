import React from "react";
import ErrorImage from "./../components/elements/ErrorImage";
import { t } from "i18next";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function Error() {
  return (
    <div className="box-full center flex-column">
      <ErrorImage image="Not-Found.svg" text={t("page not found")} full />
      <Button as={Link} to="/tickets/sent/?page=1&size=10" variant="dark">
        {t("go to back")}
      </Button>
    </div>
  );
}

export default Error;
