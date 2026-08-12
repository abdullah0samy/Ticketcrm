// // we only use the service worker now for web push notifications so we only listen on the push event.
// self.addEventListener('push', event => {
//     // we have to pass a promise to this waitUntil method, otherwise the worker get put back to sleep during our asyncronous operations.
//     event.waitUntil((async () => {
//         console.log(event);
//         // as before we get the subscription
//         const subscription = await self.registration.pushManager.getSubscription()
//         if (!subscription) {
//             throw new Error('User not subscribed');
//         }
//         const endpoint = subscription.endpoint;
        
//         // the payload we can send via the push
//         // message is quite limited, but we can
//         // load what ever you need from the
//         // server.
//         // How exactly this is implemented
//         // is up to you.

//         // const payload = await(await fetch('yourAPI/notificationText?endpoint=' + endpoint)).text();
//         // console.log(payload);

//         // you see, showing the notification on
//         // the users operating system, outside the
//         // browser is actually not part of the
//         // web-push standard, but a separate
//         // browser feature, that is available in
//         // the browser window and on the
//         // registration inside the worker.
//         self.registration.showNotification(
//             'your app notification title',
//             { body: `welocme to website notification ${Math.random()}`} //your return message 
//         );
//     })());
// });

// Register event listener for the 'push' event.
self.addEventListener('push', function(event) {
    // Retrieve the textual payload from event.data (a PushMessageData object).
    // Other formats are supported (ArrayBuffer, Blob, JSON), check out the documentation
    // on https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData.
    let payload = event.data ? event.data.text() : {"head": "No Content", "body": "No Content", "icon": ""},
      data = JSON.parse(payload),
      head = data.head,
      body = data.body,
      icon = data.icon;
      // If no url was received, it opens the home page of the website that sent the notification
      // Whitout this, it would open undefined or the service worker file.
      url = data.url ? data.url: self.location.origin;
  
    // Keep the service worker alive until the notification is created.
    event.waitUntil(
      // Show a notification with title 'ServiceWorker Cookbook' and use the payload
      // as the body.
      self.registration.showNotification(head, {
        body: body,
        icon: icon,
        data: {url: url}	
      })
    );
  });
  
  self.addEventListener('notificationclick', function (event) {
    event.waitUntil(
      event.preventDefault(),
      event.notification.close(),
      self.clients.openWindow(event.notification.data.url)
    );
  })
  