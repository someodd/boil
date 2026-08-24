/* Service worker for timeblock.
   Three jobs, no app state, no scheduling:
     1. make notifications possible at all on Android
     2. make the app installable and openable with no network
     3. bring the window back when a notification is tapped
   Stale while revalidate: the app opens instantly from cache, a new build is
   fetched in the background and takes effect the next time it is opened. */
'use strict';

const CACHE = 'timeblock-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((hit) => {
      const live = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit || caches.match('./index.html'));
      return hit || live;
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cls) => {
      for (const c of cls) if ('focus' in c) return c.focus();
      return self.clients.openWindow('./');
    })
  );
});

/* A goal lands at a moment the phone has usually already killed the page, so the app
   cannot fire the notification then. It books it here instead: one triggered
   notification per running timer, held by the OS, surviving the app being closed.
   Rebooked whenever a timer starts, stops or moves. */
const GOAL = 'tb-goal-';
const canTrigger = typeof TimestampTrigger !== 'undefined' && 'showTrigger' in Notification.prototype;

async function clearPending(prefix) {
  /* only the ones still waiting: anything getNotifications() reports without
     includeTriggered has already been shown, and dismissing that would take a
     notification off the user's screen before they had read it */
  const shown = new Set((await self.registration.getNotifications()).map((n) => n.tag));
  let all = [];
  try { all = await self.registration.getNotifications({ includeTriggered: true }); } catch (e) { all = []; }
  all.forEach((n) => { if (n.tag && n.tag.startsWith(prefix) && !shown.has(n.tag)) n.close(); });
}

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type !== 'schedule' && d.type !== 'clear') return;
  const prefix = d.prefix || GOAL;
  e.waitUntil((async () => {
    await clearPending(prefix);
    if (d.type === 'clear' || !canTrigger) return;
    for (const it of d.items || []) {
      try {
        await self.registration.showNotification(it.title, {
          body: it.body, tag: it.tag, vibrate: [200, 100, 200], showTrigger: new TimestampTrigger(it.at),
        });
      } catch (err) {}
    }
  })());
});
