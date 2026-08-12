/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import { t } from "i18next";
import { Close } from "../Icons";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import makeAnimated from "react-select/animated";
import { optionsSize, optionsStatus } from "./../../data/filter";
import moment from "moment/moment";
import { Form } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

export function SelectSize() {
  const fieldRef = useRef(null);
  let [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);

  useEffect(() => {
    const getSize = {
      value: params.size ? params.size : "10",
      label: params.size ? params.size : "10",
    };
    fieldRef.current.setValue(getSize);
  }, [searchParams]);

  const handelField = (event, name) => {
    const { value } = event;
    setSearchParams({ ...params, size: value });
  };

  return (
    <Form.Group className="mb-2">
      <Form.Label className="mb-1">{t("size")}</Form.Label>
      <Select
        ref={fieldRef}
        options={optionsSize}
        isSearchable={false}
        placeholder={t("placeholder size")}
        onChange={(event) => handelField(event, "size")}
      />
    </Form.Group>
  );
}

export function SelectStatus({ handelMultifield, getParamsValus }) {
  const animatedComponents = makeAnimated();
  const fieldRef = useRef(null);
  let [searchParams] = useSearchParams();

  useEffect(() => {
    fieldRef.current.setValue(getParamsValus("status"));
  }, [searchParams]);

  return (
    <Form.Group className="mb-2">
      <Form.Label className="mb-1">{t("status")}</Form.Label>
      <Select
        name="status"
        isMulti
        ref={fieldRef}
        isSearchable={false}
        placeholder={t("placeholder status")}
        options={optionsStatus}
        onChange={(event) => handelMultifield(event, "status")}
        components={animatedComponents}
      />
    </Form.Group>
  );
}

export function SelectTicketId({ handelMultifield, getParamsValus }) {
  const animatedComponents = makeAnimated();
  const fieldRef = useRef(null);
  let [searchParams] = useSearchParams();

  const checkCreateValue = (inputValue) => {
    const converToNum = isNaN(+inputValue);
    return !converToNum && inputValue.length !== 0;
  };

  useEffect(() => {
    fieldRef.current.setValue(getParamsValus("id"));
  }, [searchParams]);

  return (
    <Form.Group className="mb-2">
      <Form.Label className="mb-1">{t("ticket id")}</Form.Label>
      <CreatableSelect
        name="id"
        isMulti
        ref={fieldRef}
        onChange={(event) => handelMultifield(event, "id")}
        isClearable
        placeholder={t("placeholder ticketid")}
        components={animatedComponents}
        isValidNewOption={checkCreateValue}
      />
    </Form.Group>
  );
}

export function SelectIssuesType({ issues, handelMultifield, getParamsValus }) {
  const animatedComponents = makeAnimated();
  const fieldRef = useRef(null);
  let [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("issuetype")) {
      const getParamsValus = issues.filter((item) => {
        return searchParams
          .get("issuetype")
          .split(",")
          .includes(item.value.toString());
      });
      fieldRef.current.setValue(getParamsValus);
    }
  }, [searchParams, issues]);

  return (
    <Form.Group className="mb-2">
      <Form.Label className="mb-1">{t("issus type")}</Form.Label>
      <Select
        name="issuetype"
        isMulti
        ref={fieldRef}
        options={issues}
        isSearchable={false}
        placeholder={t("placeholder issuetype")}
        onChange={(event) => handelMultifield(event, "issuetype")}
        components={animatedComponents}
      />
    </Form.Group>
  );
}

export function SelectDateRange({ filter, setFilter }) {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  let [searchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);

  const handelDate = (update) => {
    setDateRange(update);
    if (update[1] !== null) {
      const created_at = `${moment(update[0]).format("DD-MM-YYYY")} ${
        update[1] ? moment(update[1]).format("DD-MM-YYYY") : ""
      }`;
      setFilter({ ...filter, created_at: created_at });
    }
  };

  const restDate = () => {
    setDateRange([null, null]);
    delete filter.created_at;
    setFilter({ ...filter });
  };

  useEffect(() => {
    if (!params.created_at) {
      setDateRange([null, null]);
    }
  }, [searchParams]);

  return (
    <Form.Group className="mb-2">
      <Form.Label className="mb-1">{t("date")}</Form.Label>
      <div className="position-relative">
        <Form.Control
          type="date"
          placeholderText={
            params.created_at ? params.created_at : t("placeholder date")
          }
          as={DatePicker}
          dateFormat="dd-MM-yyyy"
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          maxDate={new Date()}
          showMonthDropdown
          showYearDropdown
          shouldCloseOnSelect={false}
          dropdownMode="select"
          onChange={(update) => handelDate(update)}
          withPortal
        />
        <Close
          width="20px"
          onClick={restDate}
          className="rest-filed rest-filed__date"
        />
      </div>
    </Form.Group>
  );
}
