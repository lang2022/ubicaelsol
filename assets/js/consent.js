/* Ubicá el Sol — consent manager.
   Gates advertising and analytics behind an explicit user choice. */

(function () {
  "use strict";

  var KEY = "usol_consent_v1";
  var bannerEl = null;

  var STRINGS = {
    es: {
      title: "Tu privacidad",
      text: "Usamos almacenamiento local para guardar tu progreso. Con tu permiso también cargamos anuncios y estadísticas para mantener el juego gratis.",
      accept: "Aceptar todo",
      reject: "Solo lo necesario",
      more: "Más información",
      moreHref: "cookies.html"
    },
    en: {
      title: "Your privacy",
      text: "We use local storage to keep your progress. With your permission we also load ads and analytics to keep the game free.",
      accept: "Accept all",
      reject: "Essential only",
      more: "More information",
      moreHref: "cookies.html"
    }
  };

  function lang() {
    return (document.documentElement.getAttribute("data-page-lang") || document.documentElement.lang || "es").slice(0, 2).toLowerCase() === "en" ? "en" : "es";
  }

  function read() {
    try {
      return window.localStorage.getItem(KEY);
    } catch (err) {
      return null;
    }
  }

  function write(value) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch (err) {
      /* ignore */
    }
  }

  function emit(value) {
    document.dispatchEvent(new CustomEvent("usol:consent", { detail: { value: value } }));
  }

  function resolve(value) {
    write(value);
    if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
    bannerEl = null;
    emit(value);
  }

  function buildBanner() {
    var t = STRINGS[lang()];
    bannerEl = document.createElement("div");
    bannerEl.className = "consent-banner";
    bannerEl.setAttribute("role", "dialog");
    bannerEl.setAttribute("aria-live", "polite");
    bannerEl.setAttribute("aria-label", t.title);
    bannerEl.innerHTML =
      '<div class="consent-banner__inner">' +
      '<div class="consent-banner__body">' +
      '<strong class="consent-banner__title">' + t.title + "</strong>" +
      "<p>" + t.text + ' <a href="' + t.moreHref + '">' + t.more + "</a></p>" +
      "</div>" +
      '<div class="consent-banner__actions">' +
      '<button type="button" class="btn btn--ghost" data-consent="denied">' + t.reject + "</button>" +
      '<button type="button" class="btn btn--sun" data-consent="granted">' + t.accept + "</button>" +
      "</div>" +
      "</div>";
    document.body.appendChild(bannerEl);
    bannerEl.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-consent]");
      if (btn) resolve(btn.getAttribute("data-consent"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stored = read();
    if (stored === "granted" || stored === "denied") {
      emit(stored);
      return;
    }
    buildBanner();
  });

  window.USOL_CONSENT = {
    get: read,
    set: resolve
  };
})();
