/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyB2Qset2DqzP4EZ-mm7mcFb5NBZO-Nb8f0",
  authDomain: "ticketingsystem-298e2.firebaseapp.com",
  projectId: "ticketingsystem-298e2",
  storageBucket: "ticketingsystem-298e2.appspot.com",
  messagingSenderId: "994181778023",
  appId: "1:994181778023:web:9dc16fd48b917fe5efa2c2",
  measurementId: "G-70XLDQ5Y07"
};


firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.image,
    image: payload.data.image,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

