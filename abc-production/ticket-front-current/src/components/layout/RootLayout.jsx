import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSelector } from "react-redux";
import { NextUIProvider } from "@nextui-org/react";

export default function RootLayout() {
  const { isLogged } = useSelector((state) => state.account);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const openSidebar = () => setIsOpenSidebar(true);
  const closeSidebar = () => setIsOpenSidebar(false);

  // Navigating from a link inside the drawer should leave it closed, otherwise
  // the new page opens hidden behind it on a phone.
  useEffect(() => {
    setIsOpenSidebar(false);
  }, [pathname]);

  // Don't let the page behind the drawer scroll under your finger.
  useEffect(() => {
    document.body.style.overflow = isOpenSidebar ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpenSidebar]);

  if (!isLogged) {
    return <Navigate to="/login" />;
  }

  return (
    <NextUIProvider navigate={navigate}>
      <Sidebar isActive={isOpenSidebar} closeSidebar={closeSidebar} />

      {/* Tapping outside the drawer closes it — expected on touch devices. */}
      {isOpenSidebar ? (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          role="presentation"
          aria-hidden="true"
        />
      ) : null}

      <main className="content_area">
        <Header openSidebar={openSidebar} />
        <div className="container px-3 sm:px-4">
          <Outlet />
        </div>
      </main>
    </NextUIProvider>
  );
}
