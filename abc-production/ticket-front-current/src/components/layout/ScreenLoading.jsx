import { Spinner } from "@nextui-org/react";
import React from "react";

export default function ScreenLoading() {
  return (
    <div className="w-screen h-screen box-center">
      <Spinner label="loading" color="primary" labelColor="foreground" />
    </div>
  );
}
