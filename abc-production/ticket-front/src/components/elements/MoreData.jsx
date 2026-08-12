import React from "react";
import { Button } from "react-bootstrap";
import { t } from "i18next";

function MoreData({ next, text, action, size }) {
  if (next) {
    return (
      <div className="center py-2 mt-2">
        <Button
          size={size === "md" ? "md" : "sm"}
          variant="dark"
          className="m-auto"
          onClick={action}
        >
          {t("load more")}
        </Button>
      </div>
    );
  }
}

export default MoreData;
