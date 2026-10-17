/* Ubicá el Sol — interface translations (es / en).
   Content pages stay in Spanish for SEO; this covers the game UI. */

(function () {
  "use strict";

  var dict = {
    es: {
      "nav.play": "Jugar",
      "nav.howto": "Cómo jugar",
      "nav.about": "El reto",
      "nav.faq": "Preguntas",
      "brand.tag": "Reto de precisión",
      "hero.badge": "Desafío original",
      "hero.title": "¿Podés ubicar el sol en el centro exacto?",
      "hero.sub": "Ajustá el tamaño, ubicá el símbolo y descubrí qué tan precisa es tu puntería. Tres rondas, un resultado para compartir.",
      "how.title": "Cómo funciona el reto",
      "how.sub": "Cuatro pasos simples, sin reglas complicadas.",
      "how.1.t": "Elegí tu modo",
      "how.1.d": "Clásico, contrarreloj o desafío diario.",
      "how.2.t": "Movés el sol",
      "how.2.d": "Arrastralo con el mouse o el dedo hasta el lugar que creés correcto.",
      "how.3.t": "Ajustás el tamaño",
      "how.3.d": "Usá el control deslizante para que el símbolo tenga la proporción justa.",
      "how.4.t": "Confirmás y compartís",
      "how.4.d": "Vas a obtener un porcentaje de precisión listo para compartir.",
      "feat.title": "Pensado para jugar en cualquier lugar",
      "feat.1.t": "Funciona en el celular",
      "feat.1.d": "Diseñado para pantallas táctiles, con controles simples y cómodos.",
      "feat.2.t": "Partidas cortas",
      "feat.2.d": "Tres rondas y un resultado. Ideal para unos minutos libres.",
      "feat.3.t": "Resultado para compartir",
      "feat.3.d": "Copiá tu puntaje o publicalo en X y desafiá a tus amigos.",
      "board.round": "Ronda",
      "board.start.title": "¿Te animás?",
      "board.start.desc": "Mové el sol al lugar que creés correcto en la bandera. Tardás menos de un minuto.",
      "board.start.btn": "Empezar desafío",
      "board.next.btn": "Siguiente ronda",
      "board.ready": "Listo para jugar",
      "board.drag": "Arrastrá el sol para moverlo",
      "board.size": "Tamaño del sol",
      "board.confirm": "Confirmar resultado",
      "board.reset": "Reiniciar",
      "board.time": "Tiempo",
      "board.guides": "Mostrar guías",
      "score.title": "Tu desafío",
      "score.round": "Ronda actual",
      "score.best": "Mejor resultado",
      "score.mode": "Modo",
      "score.plays": "Partidas jugadas",
      "score.hint": "Consejo: primero buscá el centro, después ajustá el tamaño.",
      "mode.title": "Elegí un modo",
      "mode.classic.title": "Clásico",
      "mode.classic.desc": "Tres rondas, sin apuro.",
      "mode.timed.title": "Contrarreloj",
      "mode.timed.desc": "Tres rondas de 20 segundos cada una.",
      "mode.daily.title": "Desafío diario",
      "mode.daily.desc": "Todos juegan la misma bandera hoy.",
      "mode.quick.title": "Rápido",
      "mode.quick.desc": "Una sola ronda, al instante.",
      "hero.playQuick": "Jugar rápido",
      "hero.howtoLink": "Cómo se juega",
      "board.quick.btn": "Jugar rápido",
      "board.full.btn": "Desafío completo (3 rondas)",
      "board.start.desc2": "Una ronda y listo, o un desafío completo de tres rondas.",
      "share.download": "Descargar imagen",
      "share.copy": "Copiar texto",
      "share.image": "Compartir imagen",
      "share.downloaded": "Imagen descargada",
      "share.downloadFail": "No pudimos generar la imagen",
      "banner.text": "¡Alguien sacó {score}%! ¿Podés superarlo?",
      "banner.cta": "Aceptar el reto",
      "banner.close": "Cerrar aviso",
      "result.challengeFull": "Probar el desafío completo",
      "result.title": "Resultado final",
      "result.grade.almost-perfect": "¡Casi perfecto!",
      "result.grade.great": "Muy buena precisión",
      "result.grade.good": "Buen intento",
      "result.grade.keep-trying": "Podés mejorar",
      "result.grade.try-again": "Probá otra vez",
      "result.note": "Tu posición quedó a {cm} cm del centro ideal en una bandera de {width} cm.",
      "result.breakdown.position": "Posición",
      "result.breakdown.size": "Tamaño",
      "result.breakdown.total": "Total",
      "result.playAgain": "Jugar otra vez",
      "result.share": "Compartir resultado",
      "result.shareX": "Compartir en X",
      "result.close": "Cerrar",
      "result.copyNote": "Se copió tu resultado al portapapeles.",
      "share.text": "Saqué {score}% de precisión en Ubicá el Sol. ¿Podés superarme?",
      "toast.copied": "Resultado copiado",
      "toast.shareFail": "No pudimos compartir. Se copió el texto.",
      "toast.sizeLimit": "Ese es el tamaño máximo del sol.",
      "controls.hint": "Consejo: usá el control para cambiar el tamaño del sol.",
      "controls.confirm": "Confirmar",
      "controls.next": "Siguiente",
      "faq.title": "Preguntas frecuentes",
      "cta.title": "¿Listo para medir tu puntería?",
      "cta.text": "Es gratis, no hace falta registrarse y se juega desde el celular.",
      "cta.btn": "Jugar ahora"
    },
    en: {
      "nav.play": "Play",
      "nav.howto": "How to play",
      "nav.about": "The challenge",
      "nav.faq": "FAQ",
      "brand.tag": "Precision challenge",
      "hero.badge": "Original challenge",
      "hero.title": "Can you place the sun exactly in the middle?",
      "hero.sub": "Adjust the size, place the symbol and find out how accurate you are. Three rounds, one score to share.",
      "how.title": "How the challenge works",
      "how.sub": "Four simple steps, no complicated rules.",
      "how.1.t": "Pick your mode",
      "how.1.d": "Classic, time attack or daily challenge.",
      "how.2.t": "Move the sun",
      "how.2.d": "Drag it with the mouse or your finger to where you think it belongs.",
      "how.3.t": "Adjust the size",
      "how.3.d": "Use the slider so the symbol has the right proportion.",
      "how.4.t": "Confirm and share",
      "how.4.d": "You will get a precision score ready to share.",
      "feat.title": "Built to play anywhere",
      "feat.1.t": "Works on mobile",
      "feat.1.d": "Designed for touch screens, with simple and comfortable controls.",
      "feat.2.t": "Short games",
      "feat.2.d": "Three rounds and one score. Perfect for a few spare minutes.",
      "feat.3.t": "A score worth sharing",
      "feat.3.d": "Copy your score or post it on X to challenge your friends.",
      "board.round": "Round",
      "board.start.title": "Think you can do it?",
      "board.start.desc": "Move the sun to where you think it belongs on the flag. Takes less than a minute.",
      "board.start.btn": "Start challenge",
      "board.next.btn": "Next round",
      "board.ready": "Ready to play",
      "board.drag": "Drag the sun to move it",
      "board.size": "Sun size",
      "board.confirm": "Confirm result",
      "board.reset": "Reset",
      "board.time": "Time",
      "board.guides": "Show guides",
      "score.title": "Your challenge",
      "score.round": "Current round",
      "score.best": "Best score",
      "score.mode": "Mode",
      "score.plays": "Games played",
      "score.hint": "Tip: find the centre first, then adjust the size.",
      "mode.title": "Choose a mode",
      "mode.classic.title": "Classic",
      "mode.classic.desc": "Three rounds, no pressure.",
      "mode.timed.title": "Time attack",
      "mode.timed.desc": "Three rounds, 20 seconds each.",
      "mode.daily.title": "Daily challenge",
      "mode.daily.desc": "Everyone plays the same flag today.",
      "mode.quick.title": "Quick",
      "mode.quick.desc": "A single round, instantly.",
      "hero.playQuick": "Play quick",
      "hero.howtoLink": "How to play",
      "board.quick.btn": "Play quick",
      "board.full.btn": "Full challenge (3 rounds)",
      "board.start.desc2": "One round and done, or a full three-round challenge.",
      "share.download": "Download image",
      "share.copy": "Copy text",
      "share.image": "Share image",
      "share.downloaded": "Image downloaded",
      "share.downloadFail": "We could not generate the image",
      "banner.text": "Someone scored {score}%! Can you beat it?",
      "banner.cta": "Accept the challenge",
      "banner.close": "Close notice",
      "result.challengeFull": "Try the full challenge",
      "result.title": "Final result",
      "result.grade.almost-perfect": "Almost perfect!",
      "result.grade.great": "Great precision",
      "result.grade.good": "Good attempt",
      "result.grade.keep-trying": "You can improve",
      "result.grade.try-again": "Try again",
      "result.note": "Your position was {cm} cm away from the ideal centre on a {width} cm flag.",
      "result.breakdown.position": "Position",
      "result.breakdown.size": "Size",
      "result.breakdown.total": "Total",
      "result.playAgain": "Play again",
      "result.share": "Share result",
      "result.shareX": "Share on X",
      "result.close": "Close",
      "result.copyNote": "Your result was copied to the clipboard.",
      "share.text": "I scored {score}% precision on Ubicá el Sol. Can you beat me?",
      "toast.copied": "Result copied",
      "toast.shareFail": "Sharing failed. Text copied instead.",
      "toast.sizeLimit": "That is the maximum sun size.",
      "controls.hint": "Tip: use the slider to change the sun size.",
      "controls.confirm": "Confirm",
      "controls.next": "Next",
      "faq.title": "Frequently asked questions",
      "cta.title": "Ready to test your aim?",
      "cta.text": "It is free, no sign-up needed, and works on mobile.",
      "cta.btn": "Play now"
    }
  };

  var STORAGE_KEY = "usol_lang";

  function current() {
    var pageLang = document.documentElement.getAttribute("data-page-lang");
    if (pageLang && dict[pageLang]) return pageLang;
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && dict[saved]) return saved;
    } catch (err) {
      /* ignore */
    }
    var nav = (navigator.language || "es").slice(0, 2).toLowerCase();
    return dict[nav] ? nav : window.USOL_CONFIG.defaultLang;
  }

  function t(key, vars) {
    var lang = current();
    var table = dict[lang] || dict.es;
    var value = table[key] != null ? table[key] : (dict.es[key] != null ? dict.es[key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        value = value.replace("{" + k + "}", vars[k]);
      });
    }
    return value;
  }

  function apply(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    scope.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      var parts = el.getAttribute("data-i18n-attr").split(":");
      if (parts.length === 2) {
        el.setAttribute(parts[0], t(parts[1]));
      }
    });
  }

  function setLang(lang) {
    if (!dict[lang]) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      /* ignore */
    }
    document.documentElement.lang = lang;
    apply();
    document.querySelectorAll(".lang-switch [data-lang]").forEach(function (link) {
      var isCurrent = link.getAttribute("data-lang") === lang;
      if (isCurrent) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    document.dispatchEvent(new CustomEvent("usol:langchange", { detail: { lang: lang } }));
  }

  window.USOL_I18N = { t: t, apply: apply, current: current, setLang: setLang, dict: dict };
})();
