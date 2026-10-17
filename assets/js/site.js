/* Ubicá el Sol — shared site behaviour. */

(function () {
  "use strict";

  var cfg = window.USOL_CONFIG || {};
  var i18n = window.USOL_I18N;
  var analytics = window.USOL_ANALYTICS;

  function initLang() {
    var lang = i18n.current();
    document.documentElement.lang = lang;
    i18n.apply();
    document.querySelectorAll(".lang-link").forEach(function (link) {
      if (link.getAttribute("data-lang") === lang) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function initPageTracking() {
    if (!analytics) return;
    analytics.track("page_view", {
      path: window.location.pathname,
      title: document.title
    });
  }

  function initGA() {
    if (!cfg.gaMeasurementId) return;
    var id = cfg.gaMeasurementId;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
  }

  document.addEventListener("usol:langchange", function () {
    var label = document.documentElement.lang === "en" ? "language_en" : "language_es";
    if (analytics) analytics.track("language_change", { lang: document.documentElement.lang });
    void label;
  });

  document.addEventListener("usol:consent", function (event) {
    if (event.detail && event.detail.value === "granted") initGA();
  });

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.USOL_CONSENT) initGA();
    initLang();
    initNav();
    initYear();
    initPageTracking();
  });
})();
