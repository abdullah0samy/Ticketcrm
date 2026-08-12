import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import { NextUIProvider } from "@nextui-org/react";

function PrLayout() {
  const { userData, isLogged } = useSelector((state) => state.account);
  const navigate = useNavigate();

  if (!isLogged) {
    return <Navigate to="/login" />;
  }

  return (
    <NextUIProvider navigate={navigate} locale="ar" direction="rlt">
      <main>
        <Header />
        <div className="container overflow-auto h-content">
          {userData.department.modules.includes("pr") ? (
            <Outlet />
          ) : (
            "not allowd"
          )}
        </div>
      </main>
    </NextUIProvider>
  );
}

export default PrLayout;
