// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', () => {
  // eslint-disable-next-line no-restricted-globals
  self.skipWaiting();
});
// eslint-disable-next-line no-restricted-globals
self.addEventListener('push', (event) => {
  // eslint-disable-next-line no-console
  console.log('push received', event);
  const data = event.data.json();
  // eslint-disable-next-line no-restricted-globals
  const promiseChain = self.registration.showNotification(data.title, {
    body: data.readingDetails,
    icon: '/push_notification_icon.jpg',
  });
  event.waitUntil(promiseChain);
});
