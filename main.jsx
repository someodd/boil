import { createRoot } from "react-dom/client";
import Timeblock from "./timeblock.jsx";

/* The app was written against a host that provides an async key/value store.
   A browser has localStorage: same durability, same origin, synchronous.
   Shimming here rather than rewriting keeps timeblock.jsx host agnostic. */
if (!window.storage) {
  window.storage = {
    get: async (k) => {
      const value = localStorage.getItem(k);
      return value === null ? null : { value };
    },
    set: async (k, value) => { localStorage.setItem(k, value); },
  };
}

/* Android Chrome refuses `new Notification()` — reminders must come from the
   service worker registration. The app reads window.__sw at call time. */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
  navigator.serviceWorker.ready.then((r) => { window.__sw = r; }).catch(() => {});
}

createRoot(document.getElementById("root")).render(<Timeblock />);
