import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "react-datepicker/dist/react-datepicker.css";
import "./i18n.js";
import "./index.css";
import "react-gallery-carousel/dist/index.css";
import "./api/axios-global";
import store from "./redux/store";
import { Provider } from "react-redux";
import WebSocketProvider from "./socket-context.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </Provider>
);
