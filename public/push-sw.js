/* FactorFit Web Push worker: colocar en public/ y servir desde /push-sw.js */
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { title: 'FactorFit', body: event.data?.text() || '' }; }
  const title = String(payload.title || 'FactorFit');
  const url = String(payload.url || '/GYM_ACCOUNT/dashboard');
  const safeUrl = url.startsWith('/') && !url.startsWith('//') ? url : '/GYM_ACCOUNT/dashboard';
  event.waitUntil(self.registration.showNotification(title, {
    body: String(payload.body || 'Tienes una notificación nueva.'),
    icon: '/favicon.ico', badge: '/favicon.ico',
    tag: String(payload.tag || 'factorfit'),
    data: { url: safeUrl },
    renotify: false
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const path = event.notification.data?.url || '/GYM_ACCOUNT/dashboard';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin) {
        client.navigate(path); return client.focus();
      }
    }
    return clients.openWindow(path);
  }));
});
