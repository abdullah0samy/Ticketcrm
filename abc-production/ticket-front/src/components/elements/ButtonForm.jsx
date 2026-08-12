import React from "react";
import { Button, Spinner } from "react-bootstrap";

function ButtonForm({ text, isSubmitting, ...rest }) {
  return (
    <Button
    className=""
      type="submit"
      disabled={isSubmitting}
      {...rest}
    >
      {isSubmitting && (
        <Spinner className="ms-2" as="span" animation="border" size="sm" />
      )}
      {text}
    </Button>
  );
}

export default ButtonForm;
