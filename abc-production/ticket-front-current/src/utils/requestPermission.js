import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import axios from "axios";

export const requestPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    // fire
    try {
      const fcmToken = await getToken(messaging, {
        vapidKey:
          "BM71eKrm2mKzK5CSgfvZirjc9IZ-rF9ILJJ2Ye3AxVD4vbTI8Z1mQ5YD30vCuH8ZHN4-8HP33OOiyFCjHtx-ZMQ",
      });
      await axios.post("/users/fcm/devices/", {
        type: "web",
        registration_id: fcmToken,
      });
    } catch (error) {
      console.log(error);
    }
  } else if (permission === "denied") {
    console.log("denied");
  }
};
