// Service worker for boil — notification relay only, zero app state, no caching
'use strict';

let _timers = [];
const _hasTrigger = typeof TimestampTrigger !== 'undefined';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', evt => evt.waitUntil(self.clients.claim()));

self.addEventListener('message', evt => {
  const d = evt.data;
  if (!d || !d.type) return;

  if (d.type === 'notify') {
    self.registration.showNotification(d.title, {
      body: d.body, tag: d.tag || '', vibrate: d.vibrate || [200, 100, 200]
    });
  }

  if (d.type === 'schedule') {
    const items = d.items || [];
    if (_hasTrigger) {
      // Tier 1: OS-level scheduling — survives SW termination
      items.forEach(n => {
        self.registration.showNotification(n.title, {
          body: n.body, tag: n.tag || '', vibrate: [200, 100, 200],
          showTrigger: new TimestampTrigger(Date.now() + n.ms)
        });
      });
    } else {
      // Tier 2: SW-level timers — ~5 min budget via waitUntil
      evt.waitUntil(new Promise(resolve => {
        let maxMs = 0;
        items.forEach(n => {
          maxMs = Math.max(maxMs, n.ms);
          _timers.push(setTimeout(() => {
            self.registration.showNotification(n.title, {
              body: n.body, tag: n.tag || '', vibrate: [200, 100, 200]
            });
          }, n.ms));
        });
        setTimeout(resolve, maxMs + 1000);
      }));
    }
  }

  if (d.type === 'clear') {
    _timers.forEach(clearTimeout);
    _timers = [];
    // Cancel triggered notifications (Triggers API) and shown notifications
    self.registration.getNotifications(_hasTrigger ? { includeTriggered: true } : {}).then(ns => {
      const prefix = d.tagPrefix || 'boil-';
      ns.forEach(n => { if (n.tag && n.tag.startsWith(prefix)) n.close(); });
    });
  }
});

self.addEventListener('notificationclick', evt => {
  evt.notification.close();
  evt.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      for (const c of cls) {
        if (c.url.includes('boil')) { c.focus(); return; }
      }
      return self.clients.openWindow('./');
    })
  );
});
