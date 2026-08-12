import { createContext } from "react";
import { useDispatch } from "react-redux";
import { postActions } from "./redux/slices/postsSlice";
import { ticketActions } from "./redux/slices/ticketsSlice";
import { addNewMessage } from "./redux/slices/chatSlice";
import { exportActions } from "./redux/slices/exportsSlice";
import { toast } from "sonner";
import moment from "moment";

export const webSocketContext = createContext(null);

const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  let socket = null;

  const connectSocket = () => {
    const userToken = localStorage.getItem("Token");
    // Configurable so the app can talk to a local backend (ws:// on http dev).
    const wsBase =
      process.env.REACT_APP_WS_BASE || "wss://support.telast.tech:8000";
    socket = new WebSocket(`${wsBase}/ws/?${userToken}`);
    socket.onopen = (event) => {
      console.log(event);
    };
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.close();
      socket = null;
      console.log("web socket disconnect");
    }
  };

  const sendSocket = (payload) => {
    if (socket) {
      console.log(payload);
      socket.send(JSON.stringify(payload));
    }
  };

  const postRealTimeActions = (type, object) => {
    if (type === "create") {
      dispatch(postActions.addNewPost(object));
    }
    if (type === "update") {
      dispatch(postActions.updatePost(object));
    }
    if (type === "delete") {
      dispatch(postActions.removePost(object.id));
    }
  };

  const ticketRealTimeActions = (type, object) => {
    if (type === "create") {
      dispatch(ticketActions.addNewTicket(object));
    }
    if (type === "update") {
      dispatch(ticketActions.updateTicket(object));
    }
    if (type === "soft_delete") {
      dispatch(ticketActions.removeTicket(object.id));
    }
  };

  const onMessageWebSocket = () => {
    socket.onmessage = function (event) {
      const jsonData = JSON.parse(event.data);
      const { action, type, model, object, data = {} } = jsonData;
      console.log(jsonData);
      try {
        if (action === "realtime_changes" && model === "note") {
          postRealTimeActions(type, object);
        }
        if (action === "realtime_changes" && model === "ticket") {
          ticketRealTimeActions(type, object);
        }
        if (action === "notifications") {
          // dispatch(addNewNotification(data));
          toast.message(data.message, {
            description: moment(data.message).format("l Lt"),
          });
          document
            .getElementById("notification_sound")
            .play()
            .catch(function (error) {
              console.log(
                "Chrome cannot play sound without user interaction first"
              );
            });
        }
        if (action === "talk") {
          dispatch(addNewMessage(data));
        }
        if (action === "export") {
          dispatch(exportActions.updateExportStatus(data.message));
        }
      } catch (err) {
        console.log(err);
      }
    };
  };

  return (
    <webSocketContext.Provider
      value={{
        socket,
        connectSocket,
        disconnectSocket,
        sendSocket,
        onMessageWebSocket,
      }}
    >
      {children}
    </webSocketContext.Provider>
  );
};

export default WebSocketProvider;
