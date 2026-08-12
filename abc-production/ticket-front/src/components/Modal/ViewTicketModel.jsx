import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { ListGroup, Modal, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ArrowPath, ChatBubble } from "../Icons";
import { useDispatch } from "react-redux";
import { getMessages, openChat } from "../../store/Slice/ChatSlice";
import { openTransfer } from "../../store/Slice/transferSlice";
import moment from "moment";
import HandelAlert from "./../elements/HandelAlert";
import MoreData from "../elements/MoreData";
import { fetchApi, fetchApiUrl } from "../../utils/crudApi";
import SliderTicket from "../elements/SliderTicket";
import { patchTicket, updateTicket } from "../../store/Slice/ticketSlice";

function ViewTicketModel({ ticketData, is_superuser, show, onHide, is_mine }) {
  const {
    id,
    complaint,
    extension,
    department,
    phone,
    Description,
    created_at,
    comment,
    images,
    status,
  } = ticketData;

  const { t, i18n } = useTranslation();
  const [isChecked, setIsChecked] = useState(status === "in progress");
  const [isLocked, setIsLocked] = useState(status !== "on hold");
  const dispatch = useDispatch();

  const openModalChat = () => {
    onHide();
    dispatch(getMessages(id));
    dispatch(openChat(id));
  };

  const openModelTransfer = () => {
    onHide();
    dispatch(openTransfer([id]));
  };

  const handelUpdateStatus = async (event) => {
    const { value, checked } = event.target;
    setIsChecked(checked);
    setIsLocked(true);
    try {
      if (checked) {
        const res = await dispatch(
          patchTicket({ status: value, ticketId: id })
        ).unwrap();
        dispatch(updateTicket(res));
      }
    } catch (error) {
      setIsLocked(false);
      setIsChecked(false);
    }
  };

  const [history, setHistory] = useState({
    historyList: [],
    loading: true,
    error: null,
    next: null,
  });
  const { historyList, loading, error, next } = history;

  const getHistory = async (ticketId) => {
    try {
      const { results, next } = await fetchApi(
        `router/ticket-history/?id=${ticketId}`
      );
      setHistory(() => {
        return {
          historyList: results,
          loading: null,
          error: null,
          next: next,
        };
      });
    } catch (error) {
      setHistory(() => {
        return {
          historyList: [],
          loading: null,
          error: error,
          next: null,
        };
      });
    }
  };

  const getNextHistory = async (nextTeicket) => {
    try {
      const { results, next } = await fetchApiUrl(nextTeicket);
      setHistory((preve) => {
        console.log(preve);
        return {
          historyList: [...preve.historyList, ...results],
          loading: null,
          error: null,
          next: next,
        };
      });
    } catch (error) {
      setHistory((preve) => {
        return {
          historyList: preve.historyList,
          loading: null,
          error: error,
          next: null,
        };
      });
    }
  };

  const historyMapping = historyList.map((item) => {
    const {
      history_id,
      department,
      issuetype,
      history_user,
      status,
      created_at,
    } = item;
    return (
      <div className="our-row" key={history_id}>
        <div className="our-cell">{t(department?.name)} </div>
        <div className="our-cell">
          {issuetype ? issuetype?.name : t("unknown")}
        </div>
        <div className="our-cell">
          <span
            className={`badge ${
              status === "on hold"
                ? "bg-danger"
                : status === "complete"
                ? "bg-success"
                : "bg-warning"
            } `}
          >
            {t(status)}
          </span>
        </div>
        <div className="our-cell">{`${history_user.first_name} ${history_user.last_name}`}</div>
        <div className="our-cell">{moment(created_at).format("l LT")}</div>
      </div>
    );
  });

  return (
    <Modal
      show={show}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      onHide={onHide}
      size="lg"
      centered
      onEnter={() => getHistory(id)}
      className="viwe_ticket"
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          {t("details ticket")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="overflow-auto">
        {images.length > 0 && <SliderTicket images={images} />}
        <ListGroup variant="flush pb-2 ">
          <ListGroup.Item className="px-0 border-0 text-capitalize">
            <span className="fw-bold">{t("user")}:</span>
            <span className="mx-1">{complaint.name}</span>
          </ListGroup.Item>
          {is_superuser ? (
            <ListGroup.Item className="px-0 border-0 text-capitalize">
              <span className="fw-bold">{t("department")}:</span>
              <span className="mx-1">{t(department.name)}</span>
              <Button
                size="sm"
                className="p-1"
                variant="light"
                disabled={status === "complete"}
              >
                <ArrowPath onClick={openModelTransfer} />
              </Button>
            </ListGroup.Item>
          ) : null}

          <ListGroup.Item className="px-0 border-0 text-capitalize">
            <span className="fw-bold">{t("Description")}:</span>
            <span className="mx-1 text-break text-wrap">{Description}</span>
          </ListGroup.Item>
          <ListGroup.Item className="px-0 border-0 text-capitalize">
            <span className="fw-bold">{t("phone")}:</span>
            <span className="mx-1">
              {phone ? `${phone.country_code}${phone.phone}` : t("unknown")}
            </span>
          </ListGroup.Item>
          <ListGroup.Item className="px-0 border-0 text-capitalize">
            <span className="fw-bold">{t("extension")}:</span>
            <span className="mx-1">{extension}</span>
          </ListGroup.Item>
          <ListGroup.Item className="px-0 border-0 text-capitalize">
            <span className="fw-bold">{t("date")}:</span>
            <span className="mx-1">{moment(created_at).format("l LT")}</span>
          </ListGroup.Item>
          <ListGroup.Item className="px-0 border-0 text-capitalize">
            <span className="fw-bold">{t("talk")}:</span>
            <span className="mx-1">
              {comment?.length >= 30
                ? `${comment?.substring(0, 30)}...`
                : comment}
            </span>
            <Button size="sm" className="p-1" variant="light">
              <ChatBubble onClick={openModalChat} />
            </Button>
          </ListGroup.Item>
        </ListGroup>
        {!is_mine && status !== "complete" ? (
          <Form.Check
            inline
            type="switch"
            className="m-0"
            id="custom-switch"
            label={t("in progress")}
            value="in progress"
            checked={isChecked}
            disabled={isLocked}
            onChange={handelUpdateStatus}
          />
        ) : null}

        <h5 className="mt-3 text-capitalize">{t("ticket history")}</h5>
        <div className="p-3 mt-2 comments-history scroll card shadow-sm bg-light">
          <div className="our-table">
            <div className="our-row">
              <div className="our-cell fw-bold">{t("department")}</div>
              <div className="our-cell fw-bold issus">{t("issus type")}</div>
              <div className="our-cell fw-bold history">{t("status")}</div>
              <div className="our-cell fw-bold">{t("user")}</div>
              <div className="our-cell fw-bold">{t("date")} </div>
            </div>
            {historyMapping}
            <HandelAlert
              dataList={historyList}
              loading={loading}
              empty={"empty"}
              error={error}
            />
          </div>
          <MoreData
            text={t("more history")}
            next={next}
            action={() => getNextHistory(next)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onHide}>
          {t("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default React.memo(ViewTicketModel);
