import React from "react";
import { Button, Container, Stack } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { openSidebar } from "../../store/Slice/sidebarSlice";
import Notice from "../elements/Notice";
import { ArrowLeft, ArrowRight, Bar } from "../Icons";
import { useTranslation } from "react-i18next";
import { logOut } from "../../store/Slice/userSlice";
import { restHospital } from "../../store/Slice/hospitalSlice";
import { restNotification } from "../../store/Slice/notificationSlice";
import { restArchives } from "../../store/Slice/archiveSlice";
import { restNote } from "../../store/Slice/noteSlice";
import { restTickets } from "../../store/Slice/ticketSlice";
import { newSocket } from "../../App";

function Header() {
  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();
  const changeLang = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  const handelLogout = () => {
    dispatch(logOut());
    dispatch(restArchives());
    dispatch(restHospital());
    dispatch(restNotification());
    dispatch(restNote());
    dispatch(restTickets());
    newSocket.disconnect()
  };

  return (
    <header className="header bg-white py-3 border-bottom shadow-sm">
      <Container className="d-flex justify-content-between">
        <div>
          <Button
            variant="light"
            size="sm"
            className="d-lg-none"
            onClick={() => dispatch(openSidebar())}
          >
            <Bar />
          </Button>
        </div>
        <Stack direction="horizontal" gap={2} className="justify-content-end">
          <Notice />
          <Button variant="dark" size="sm" onClick={changeLang}>
            {i18n.language === "ar" ? "english" : "العربيه"}
          </Button>
          <Button variant="danger" size="sm" onClick={handelLogout}>
            {t("logout")}{" "}
            {i18n.language === "ar" ? (
              <ArrowLeft width="22px" />
            ) : (
              <ArrowRight width="22px" />
            )}
          </Button>
        </Stack>
      </Container>
    </header>
  );
}

export default Header;
