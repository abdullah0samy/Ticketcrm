import { useState } from "react";

function useWebSocket(url) {
  let socket = null;

  const connect = () => {
    socket = new WebSocket(url);

    socket.onopen = (event) => {
      console.log(event);
    };
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      socket = null;
    } else {
      console.log("You should contact me on WebSocket");
    }
  };

  const sendMessage = (message) => {
    if (socket) {
      socket.send(JSON.stringify(message));
    } else {
      console.log("You should contact me on WebSocket");
    }
  };

  const onOpene = () => {
    socket.onopen((event) => {
      console.log(event);
    });
  };

  return {
    connect,
    disconnect,
    sendMessage,
    onOpene,
  };
}

export default useWebSocket;
