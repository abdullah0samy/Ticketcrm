// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2Qset2DqzP4EZ-mm7mcFb5NBZO-Nb8f0",
  authDomain: "ticketingsystem-298e2.firebaseapp.com",
  projectId: "ticketingsystem-298e2",
  storageBucket: "ticketingsystem-298e2.appspot.com",
  messagingSenderId: "994181778023",
  appId: "1:994181778023:web:9dc16fd48b917fe5efa2c2",
  measurementId: "G-70XLDQ5Y07"
}
// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const messaging = getMessaging(firebaseApp);

onMessage(messaging, ({ notification }) => {
  const { body, title } = notification;
  new Notification(title, {
    body: body,
    icon: "./img/goodday.png",
  });
  // ...
});
