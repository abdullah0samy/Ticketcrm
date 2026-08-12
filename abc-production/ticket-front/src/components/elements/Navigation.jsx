import React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  Home,
  AddFolder,
  Chart,
  Setting,
  ClipboardPlus,
  Receive,
  Sent,
  Guide,
  Exports,
} from "../Icons";
import { closeSidebar } from "../../store/Slice/sidebarSlice";

function Navigation() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    userData: { department, is_superuser },
  } = useSelector((state) => state.user);

  return (
    <ListGroup className="rounded-0 mt-4">
      {(is_superuser && department.reciever && department.id !== 0) ? (
        <ListGroupItem
          as={NavLink}
          to="/"
          className="border-0 rounded hstack gap-2 mt-1"
          onClick={() => dispatch(closeSidebar())}
        >
          <Home className="fs-4" /> {t("home")}
        </ListGroupItem>
      ) : null}

      {((is_superuser && department.reciever) || (department.id === 0)) ? (
        <>
          <ListGroupItem
            as={NavLink}
            to="/statistics"
            className="border-0 rounded hstack gap-2 mt-1"
            onClick={() => dispatch(closeSidebar())}
          >
            <Chart className="fs-5" /> {t("statistics")}
          </ListGroupItem>
          <ListGroupItem
            as={NavLink}
            to="/exports"
            className="border-0 rounded hstack gap-2 mt-1"
            onClick={() => dispatch(closeSidebar())}
          >
            <Exports className="fs-5" /> {t("exports")}
          </ListGroupItem>
        </>
      ) : null}

      {(is_superuser && department.reciever && department.id !== 0) ?
        <ListGroupItem
          as={NavLink}
          to="/archive/?page=1&size=10"
          className="border-0 rounded hstack gap-2 mt-1"
          onClick={() => dispatch(closeSidebar())}
        >
          <ClipboardPlus className="fs-5" /> {t("archive tickets")}
        </ListGroupItem>
        : null}

      <ListGroupItem
        as={NavLink}
        to="/addticket"
        className="border-0 rounded hstack gap-2 mt-1"
        onClick={() => dispatch(closeSidebar())}
      >
        <AddFolder className="fs-5" /> {t("add ticket")}
      </ListGroupItem>
      {(department.reciever && department.id !== 0) ? (
        <ListGroupItem
          as={NavLink}
          to="/tickets/receive/?page=1&size=10"
          className="border-0 rounded hstack gap-2 mt-1"
          onClick={() => dispatch(closeSidebar())}
        >
          <Receive className="fs-5" /> {t("receive tickets")}
        </ListGroupItem>
      ) : null}

      <ListGroupItem
        as={NavLink}
        to="/tickets/sent/?page=1&size=10"
        className="border-0 rounded hstack gap-2 mt-1"
        onClick={() => dispatch(closeSidebar())}
      >
        <Sent className="fs-5" /> {t("sent tickets")}
      </ListGroupItem>
      <ListGroupItem
        as={NavLink}
        to="/settings"
        className="border-0 rounded hstack gap-2 mt-1"
        onClick={() => dispatch(closeSidebar())}
      >
        <Setting className="fs-5" /> {t("settings")}
      </ListGroupItem>
      <ListGroupItem
        as={NavLink}
        to="/guide"
        className="border-0 rounded hstack gap-2 mt-1"
        onClick={() => dispatch(closeSidebar())}
      >
        <Guide className="fs-5" /> {t("guide")}
      </ListGroupItem>
    </ListGroup>
  );
}

export default Navigation;
