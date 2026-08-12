import { toast } from "react-toastify";
import { addNewNotification } from "../store/Slice/notificationSlice";
import { addNewMessage } from "../store/Slice/ChatSlice";
import { exporting } from "../store/Slice/exportSlice";

class Socket {
  constructor() {
    this.socket = null;
  }

  connect() {
    const userToken = localStorage.getItem("Token");
    // Configurable so the app can talk to a local backend (ws:// on http dev).
    const wsBase =
      process.env.REACT_APP_WS_BASE || "wss://support.csch-svu.com:8000";
    this.socket = new WebSocket(`${wsBase}/ws/?${userToken}`);
    this.socket.onopen = (event) => {
      console.log(event);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log("web socket disconnect");
    }
  }

  send(message) {
    if (this.socket) {
      this.socket.send(JSON.stringify(message));
    }
  }

  on(eventName, callback) {
    if (this.socket) {
      this.socket.addEventListener(eventName, callback);
    }
  }

  onMessageWebSocket(dispatch) {
    this.socket.onmessage = function (event) {
      const jsonData = JSON.parse(event.data);
      console.log("app => ", jsonData.action);
      try {
        if (jsonData.action === "notifications") {
          dispatch(addNewNotification(jsonData.data));
          toast.info(jsonData.data.message, {
            position: toast.POSITION.BOTTOM_RIGHT,
          });
          document.getElementById("sound").play();
        } else if (jsonData.action === "talk") {
          dispatch(addNewMessage(jsonData.data));
          console.log("talk data", jsonData.data);
        } else if (jsonData.action === "export") {
          console.log("export", jsonData.data);
          dispatch(exporting(jsonData.data.message));
        }
      } catch (err) {
        console.log(err);
      }
    };
  }
}
export { Socket };
