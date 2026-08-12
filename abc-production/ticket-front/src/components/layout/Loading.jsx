import React from "react";
import { Spinner } from "react-bootstrap";

function Loading() {
  return (
    <div className="box-full center">
      <div className="text-center">
        <Spinner animation="grow" />
        <p className="fs-1">Loading...</p>
      </div>
    </div>
  );
}

export default Loading;
