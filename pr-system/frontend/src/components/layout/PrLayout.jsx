import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { NextUIProvider, Spinner } from "@nextui-org/react";
import { t } from "i18next";
import Header from "./Header";

function PrLayout() {
  const { userData, isLogged } = useSelector((state) => state.account);
  const navigate = useNavigate();
  const hasToken = Boolean(localStorage.getItem("Token"));

  // `isLogged` starts as null and only turns true once getProfile() resolves.
  // Redirecting on any falsy value bounced every deep link (e.g. /view) to the
  // login page before the session had a chance to restore — so while a token is
  // present and the profile request is still in flight, show a loader instead.
  if (isLogged !== true) {
    if (hasToken) {
      return (
        <div className="w-screen h-screen box-center">
          <Spinner size="lg" />
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  const canUsePr = userData?.department?.modules?.includes("pr");

  return (
    <NextUIProvider navigate={navigate} locale="ar">
      <main>
        <Header />
        <div className="container overflow-auto h-content">
          {canUsePr ? (
            <Outlet />
          ) : (
            <div className="py-16 text-center text-default-500">
              {t("not allowed")}
            </div>
          )}
        </div>
      </main>
    </NextUIProvider>
  );
}

export default PrLayout;
