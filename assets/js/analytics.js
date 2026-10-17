/* Ubicá el Sol — lightweight analytics.
   Stores events locally and forwards to GA4 only when configured. */

(function () {
  "use strict";

  var STORAGE_KEY = "usol_events_v1";
  var sentCount = 0;

  function readLocal() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeLocal(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-200)));
    } catch (err) {
      /* storage unavailable: analytics only */
    }
  }

  function track(name, data) {
    var payload = {
      event: name,
      data: data || {},
      ts: new Date().toISOString(),
      lang: document.documentElement.lang || "es"
    };
    var events = readLocal();
    events.push(payload);
    writeLocal(events);

    if (typeof window.gtag === "function") {
      try {
        window.gtag("event", name, payload.data || {});
      } catch (err) {
        /* ignore analytics delivery errors */
      }
    }
    if (window.USOL_DEBUG) {
      sentCount += 1;
    }
  }

  function readEvents() {
    return readLocal();
  }

  window.USOL_ANALYTICS = { track: track, readEvents: readEvents };
})();
