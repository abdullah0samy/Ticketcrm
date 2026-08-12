import React from "react";
import { Button, Form, Stack } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "../Icons";

function Pagination({ next, previous }) {
  let [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);

  let pageNumber = +params.page || 1;

  const handelPagenitionInput = (e) => {
    setSearchParams({ ...params, page: e.target.value });
  };

  const handelPagenition = (type) => {
    if (type === "next") {
      setSearchParams({ ...params, page: ++pageNumber });
    } else {
      setSearchParams({ ...params, page: --pageNumber });
    }
  };

  return (
    <Stack direction="horizontal" className="mt-3 m-auto" gap={2} dir="ltr">
      <Button
        variant="light"
        size="sm"
        disabled={!previous}
        onClick={() => handelPagenition("previous")}
      >
        <ChevronLeft />
      </Button>
      <Form.Control
        size="sm"
        type="number"
        min={1}
        value={params.page}
        onChange={handelPagenitionInput}
        style={{ width: "60px" }}
      />
      <Button
        size="sm"
        disabled={!next}
        variant="light"
        onClick={() => handelPagenition("next")}
      >
        <ChevronRight />

      </Button>
    </Stack>
  );
}

export default Pagination;
