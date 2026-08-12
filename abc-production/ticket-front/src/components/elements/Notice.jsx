/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { BellAlirt } from "../Icons";
import { Button, Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  getNextNotification,
  getNotification,
  restCount,
} from "./../../store/Slice/notificationSlice";
import moment from "moment";
import MoreData from "./MoreData";
import HandelAlert from "./HandelAlert";


function Notice() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [pageNum, setPageNum] = useState(2);
  const { notificationList, loading, error, next, count_new } = useSelector(
    (state) => state.notification
  );

  const getMoreData = async () => {
    try {
      await dispatch(getNextNotification(next)).unwrap();
      setPageNum(pageNum + 1);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    dispatch(getNotification());
  }, []);

  const handelRestCount = () => {
    dispatch(restCount());
  };

  const NotificationMapping = notificationList.map((item) => {
    return (
      <Dropdown.Item key={item.id}>
        <figure>
          <blockquote className="blockquote fs-6 text-break text-wrap">
            <p>{item.message}</p>
          </blockquote>
          <figcaption className="blockquote-footer">
            {moment(item.created_at).format("l LT")}
          </figcaption>
        </figure>
      </Dropdown.Item>
    );
  });

  return (
    <div className="notice">
      <Dropdown onClick={handelRestCount}>
        <Dropdown.Toggle
          as={Button}
          split={false}
          variant="light"
          size="sm"
          id="dropdown-basic"
          className="position-relative"
        >
          <BellAlirt />
          <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-secondary">
            +{count_new} <span className="visually-hidden"></span>
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <Dropdown.Header>{t("notification")}</Dropdown.Header>
          {NotificationMapping}
          <HandelAlert
            loading={loading}
            error={error}
            empty={"empty"}
            dataList={notificationList}
          />
          <MoreData
            next={next}
            text={t("more notification")}
            action={getMoreData}
          />
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default React.memo(Notice);
