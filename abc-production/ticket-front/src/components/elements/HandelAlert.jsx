import React from "react";
import { Spinner, Alert } from "react-bootstrap";

function HandelAlert({ loading, error, empty, dataList }) {
  if (loading) {
    return <Spinner nimation="border" role="status" />;
  } else if (error) {
    return <Alert variant="danger">{error}</Alert>;
  } else if (dataList.length === 0 && !loading) {
    return <Alert variant="info">{empty}</Alert>;
  }
}

export default HandelAlert;
