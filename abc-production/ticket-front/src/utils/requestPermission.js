import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import { postApi } from "./crudApi";

export const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        // fire
        const fcmToken = await getToken(messaging, {
            vapidKey:
                "BM71eKrm2mKzK5CSgfvZirjc9IZ-rF9ILJJ2Ye3AxVD4vbTI8Z1mQ5YD30vCuH8ZHN4-8HP33OOiyFCjHtx-ZMQ",
        });
        postApi("devices/login/", {
            type: "web",
            registration_id: fcmToken,
        });
    } else if (permission === "denied") {
        console.log("denied");
    }
};