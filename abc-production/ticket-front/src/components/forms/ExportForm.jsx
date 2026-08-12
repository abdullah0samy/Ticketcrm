import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { t } from "i18next";
import { useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import moment from "moment";
import { useDispatch } from "react-redux";
import { exportFils } from "../../store/Slice/exportSlice";
import { toast } from "react-toastify";
import { Close } from "../Icons";

const ExportForm = ({ exportLoading }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [chunck, setChunck] = useState(1);
  // const [department, setDepartment] = useState(1);
  const [startDate, endDate] = dateRange;
  const dispatch = useDispatch();

  const handelDate = (update) => {
    setDateRange(update);
  };

  const handelSubmit = async () => {
    try {
      let data = {}
      let created_at = `${moment(dateRange[0]).format("DD-MM-YYYY")} ${dateRange[1] ? moment(dateRange[1]).format("DD-MM-YYYY") : ""}`;
      if (chunck) data.chunck = chunck
      if (dateRange[1] !== null) data.created_at = created_at
      // if (department) data.department = department

      dispatch(exportFils(data)).unwrap();
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const restDate = () => {
    setDateRange([null, null]);
  };

  const optionsChunk = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10" },
  ];

  return (
    <Card className="shadow-sm overflow-visible p-3 mb-3">
      <h3 className="text-capitalize mb-2">{t("export tickets")}</h3>
      <Form>
        <Row className="align-items-center">
          {/* <Col sm>
            <Form.Group className="mb-2">
              <Form.Label className="mb-1">{t("department")}</Form.Label>
              <Select
                options={[{ value: 1, label: "it" }, { value: 2, label: "it 2 " }]}
                defaultValue={optionsChunk[0]}
                isSearchable={false}
                placeholder={t("select department")}
                onChange={(e) => setDepartment(e.value)}
                name="department"
              />
            </Form.Group>
          </Col> */}
          <Col md={5}>
            <Form.Group className="mb-2">
              <Form.Label className="mb-1">{t("chunck")}</Form.Label>
              <Select
                options={optionsChunk}
                defaultValue={optionsChunk[0]}
                isSearchable={false}
                placeholder={t("placeholder size")}
                onChange={(e) => setChunck(e.value)}
                name="chunck"
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group className="mb-3">
              <Form.Label>{t("rang")}</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="date"
                  as={DatePicker}
                  placeholderText={t("select date")}
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
                  onClick={restDate}
                  width="20px"
                  className="rest-filed rest-filed__date"
                />
              </div>
            </Form.Group>
          </Col>
          <Col lg={2}>
            <Button
              className="mt-3 w-100"
              variant="success"
              onClick={handelSubmit}
              disabled={exportLoading === 1}
            >
              {exportLoading === 1
                ?
                t("exporting")
                :
                t("export")
              }
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default ExportForm;