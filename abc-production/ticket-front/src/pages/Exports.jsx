import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ExportCard from "../components/cards/ExportCard";
import HandelError from "../components/elements/HandelError";
import ExportForm from "../components/forms/ExportForm";
import { getExports, getNextExports } from "../store/Slice/exportSlice";
import { t } from "i18next";
import MoreData from "../components/elements/MoreData";
import { Navigate, useSearchParams } from "react-router-dom";
import Select from 'react-select';
import convertKey from './../utils/convertKey';

function Exports() {
  const [pageNum, setPageNum] = useState(2);
  const dispatch = useDispatch();
  let [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);
  const { department: department_options } = useSelector((state) => state.hospital);

  const {
    userData: { is_superuser, department },
  } = useSelector((state) => state.user);
  const { loading, error, next, exportsList, exportLoading } = useSelector((state) => state.export);

  useEffect(() => {
    if (department.id === 0) {
      dispatch(getExports({ department: params.department || department_options[0]?.id }));
    } else {
      dispatch(getExports());

    }
  }, [dispatch, department_options, params.department, department.id]);

  const getMoreData = () => {
    setPageNum(pageNum + 1);
    dispatch(getNextExports(next));
  };

  const handelDepartment = (event) => {
    setSearchParams({ ...params, department: event.value });
  }

  const exportMapping = exportsList.map((item) => {
    return (
      <Col md={4} key={item.id} className="mb-3">
        <ExportCard exportData={item} />
      </Col>
    );
  });
  if (department.id === 0) {
    console.log("admin");
  } else if (!is_superuser || !department.reciever) {
    return <Navigate to="/tickets/sent/?page=1&size=10" />;
  }

  return (
    <>
      {department.id !== 0
        ?
        <ExportForm exportLoading={exportLoading} />
        : null}
      <Row className="justify-content-between mt-3">
        <Col md={4}>
          <h2 className="text-capitalize">{t("files exports")}</h2>
        </Col>
        {department.id === 0
          ?
          <Col md={4}>
            <Select
              name="color"
              defaultValue={convertKey(department_options).find((el) => el.value === +params.department) || convertKey(department_options)[0]}
              placeholder={t("select department")}
              options={convertKey(department_options)}
              onChange={handelDepartment}
            />
          </Col>
          : null}
      </Row>
      <Row>
        {exportMapping}
      </Row>
      <HandelError loading={loading} error={error} dataList={exportsList} />
      <MoreData size="md" next={next} text={t("more note")} action={getMoreData} />
    </>
  );
}

export default Exports;