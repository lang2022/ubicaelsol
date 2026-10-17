/* Ubicá el Sol — AdSense loader.
   Only runs after explicit consent and when a client id is configured. */

(function () {
  "use strict";

  var cfg = window.USOL_CONFIG || {};
  var scriptLoaded = false;

  function loadScript() {
    if (scriptLoaded || !cfg.adsenseClient) return;
    scriptLoaded = true;
    var script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(cfg.adsenseClient);
    document.head.appendChild(script);
  }

  function fillSlots() {
    document.querySelectorAll("[data-ad-slot]").forEach(function (slot) {
      if (slot.getAttribute("data-ad-filled") === "true") return;
      var ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", cfg.adsenseClient);
      if (slot.getAttribute("data-ad-unit")) {
        ins.setAttribute("data-ad-slot", slot.getAttribute("data-ad-unit"));
      }
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      slot.textContent = "";
      slot.appendChild(ins);
      slot.setAttribute("data-ad-filled", "true");
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        /* ignore */
      }
    });
  }

  function hideSlots() {
    document.querySelectorAll("[data-ad-slot]").forEach(function (slot) {
      slot.hidden = true;
    });
  }

  function init() {
    if (!cfg.adsenseClient) {
      if (cfg.adsShowPlaceholder === false) hideSlots();
      return;
    }
    loadScript();
    fillSlots();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!cfg.adsEnabled) {
      if (cfg.adsShowPlaceholder === false) hideSlots();
      return;
    }
    if (window.USOL_CONSENT && window.USOL_CONSENT.get() === "granted") init();
  });

  document.addEventListener("usol:consent", function (event) {
    if (event.detail && event.detail.value === "granted" && cfg.adsEnabled) init();
  });

  window.USOL_ADS = { init: init };
})();
