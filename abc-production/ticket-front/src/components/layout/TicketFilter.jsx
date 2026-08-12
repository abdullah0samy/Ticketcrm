import React, { useEffect, useState } from "react";
import { Accordion, Button, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import convertKey from "./../../utils/convertKey";
import { useSearchParams } from "react-router-dom";
import {
  SelectDateRange,
  SelectIssuesType,
  SelectSize,
  SelectStatus,
  SelectTicketId,
} from "../forms/FilterFields";

function TicketFilter({ is_mine }) {
  const [issues, setTIssues] = useState([]);
  const [filter, setFilter] = useState({});
  const { i18n } = useTranslation();
  let [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);
  const { allIssuetype, issuetype } = useSelector((state) => state.hospital);

  useEffect(() => {
    if (is_mine) {
      const convertArray = convertKey(issuetype);
      setTIssues(convertArray);
    } else {
      const convertArray = convertKey(allIssuetype);
      setTIssues(convertArray);
    }
  }, [allIssuetype, issuetype, is_mine]);

  const handelFilter = () => {
    if (!filter.status) {
      delete params.status;
    }
    if (!filter.id) {
      delete params.id;
    }
    if (!filter.issuetype) {
      delete params.issuetype;
    }
    if (!filter.created_at) {
      delete params.created_at;
    }
    setSearchParams({ ...params, ...filter });
  };

  const restFilter = () => {
    setFilter({ page: "1", size: "10" });
    setSearchParams({ page: "1", size: "10" });
  };

  const handelMultifield = (event, name) => {
    const getfieldValue = event.map((el) => {
      return el.value;
    });
    if (event.length > 0) {
      setFilter({ ...filter, [name]: getfieldValue.join(",") });
    } else {
      delete filter[name];
      setFilter({ ...filter });
    }
  };

  const getParamsValus = (name) => {
    if (params[name]) {
      return params[name].split(",").map((item) => {
        return { value: item, label: item };
      });
    } else {
      return [];
    }
  };

  return (
    <Accordion
      className="filter card overflow-visible"
      defaultActiveKey="0"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <Accordion.Item className="border-0" eventKey="0">
        <Accordion.Header className="fs-5">
          {t("filter title")}
        </Accordion.Header>
        <Accordion.Body>
          <Form>
            <Row>
              <Col sm={6} md={4} lg={4} className="px-1">
                <SelectSize />
              </Col>
              <Col sm={6} md={4} lg={4} className="px-1">
                <SelectStatus
                  handelMultifield={handelMultifield}
                  getParamsValus={getParamsValus}
                />
              </Col>
              <Col sm={6} md={4} lg={4} className="px-1">
                <SelectTicketId
                  handelMultifield={handelMultifield}
                  getParamsValus={getParamsValus}
                />
              </Col>
              <Col sm={6} md={4} lg={4} className="px-1">
                <SelectIssuesType
                  issues={issues}
                  handelMultifield={handelMultifield}
                  getParamsValus={getParamsValus}
                />
              </Col>
              <Col sm={6} md={4} lg={4} className="px-1">
                <SelectDateRange filter={filter} setFilter={setFilter} />
              </Col>
              <Col
                sm={6}
                md={4}
                lg={4}
                className="px-1 d-flex align-items-end gap-2"
              >
                <Button className="w-100 mb-2" onClick={handelFilter}>
                  {t("filter")}
                </Button>
                <Button
                  variant="outline-secondary"
                  className="w-100 mb-2"
                  onClick={restFilter}
                >
                  {t("rest filter")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default TicketFilter;
