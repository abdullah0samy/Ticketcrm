/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from "react";
import { Col, Row, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import DoughnutChart from "../components/chart/Doughnut";
import BarLine from "../components/chart/BarLine";
import PieChart from "../components/chart/Pie";
import IssuesTable from "../components/tables/IssuesTable";
import { getStatistics } from "../store/Slice/statisticsSlice";
import { t } from "i18next";
import { useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { Close } from "./../components/Icons";
import moment from "moment";
import Gauge from "./../components/chart/Gauge";
import Select from 'react-select';
import convertKey from './../utils/convertKey';

function Statistics() {
  const { is_superuser, department } = useSelector((state) => state.user.userData);
  const { department: department_options } = useSelector((state) => state.hospital);

  const dispatch = useDispatch();
  let [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    if (department.id === 0) {
      dispatch(getStatistics({ created_at: params.created_at, department: params.department || department_options[0]?.id }));
    } else {
      dispatch(getStatistics({ created_at: params.created_at }));
    }
  }, [dispatch, params.department, params.created_at, department.id, department_options]);

  const handelSummary = (update) => {
    setDateRange(update);
    if (update[1] !== null) {
      const created_at = `${moment(update[0]).format("DD-MM-YYYY")} ${update[1] ? moment(update[1]).format("DD-MM-YYYY") : ""}`;
      setSearchParams({ ...params, created_at: created_at });
    }
  };

  const handelDepartment = (event) => {
    setSearchParams({ ...params, department: event.value });
  }
       
  const restDate = () => {
    setDateRange([null, null]);
    delete params.created_at;
    setSearchParams(params);
  };

  if (department.id === 0) {
    console.log("admin");
  } else if (!is_superuser || !department.reciever) {
    return <Navigate to="/tickets/sent/?page=1&size=10" />;
  }

  return (
    <>
      <Row className="mb-4 center-y">
        <Col md={4}>
          <Form.Group className="mb-2">
            <Form.Label className="mb-1">{t("date")}</Form.Label>
            <div className="position-relative">
              <Form.Control
                type="date"
                placeholderText={
                  params?.created_at ? params.created_at : t("placeholder date")
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
                onChange={(update) => handelSummary(update)}
                withPortal
              />
              <Close
                onClick={restDate}
                width="20px"
                className="rest-filed rest-filed__date"
              />
            </div>
          </Form.Group>
        </Col>
        {department.id === 0
          ?
          <Col md={4}>
            <Form.Group className="mb-2">
              <Form.Label className="mb-1">{t("departmant")}</Form.Label>
              <Select
                name="color"
                defaultValue={convertKey(department_options).find((el) => el.value === +params.department) || convertKey(department_options)[0]}
                options={convertKey(department_options)}
                onChange={handelDepartment}
              />
            </Form.Group>
          </Col>
          : null}
      </Row>
      <Row className="chart">
        <Col md={4} className="mb-3">
          <div className="card py-4 px-3 h-100">
            <h6 className="fs-5 text-capitalize text-center mb-3">
              {t("statistics title departments")}
            </h6>
            <DoughnutChart />
          </div>
        </Col>
        <Col md={4} className="mb-3">
          <div className="card py-4 px-3 h-100">
            <h6 className="fs-5 text-capitalize text-center mb-3">
              {t("total tickets")}
            </h6>
            <div className="h-100 w-100 center">
              <Gauge />
            </div>
          </div>
        </Col>

        <Col md={4} className="mb-3">
          <div className="card py-4 px-3 h-100">
            <h6 className="fs-5 text-capitalize text-center mb-3">
              {t("statistics title status")}
            </h6>
            <PieChart />
          </div>
        </Col>
        <Col md={12} className="mb-3">
          <div className="card py-4 px-3 h-100">
            <h6 className="fs-4 text-capitalize text-center mb-3">
              {t("statistics title issuetypes")}
            </h6>
            <BarLine />
          </div>
        </Col>
      </Row>

      <div className="p-3 mt-3 card">
        <IssuesTable />
      </div>
    </>
  );
}

export default Statistics;
