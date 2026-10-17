/* Ubicá el Sol — core game logic.
   Three-round precision challenge with original implementation. */

(function () {
  "use strict";

  var cfg = window.USOL_CONFIG;
  var score = window.USOL_SCORE;
  var S = window.USOL_SUN;
  var i18n = window.USOL_I18N;
  var analytics = window.USOL_ANALYTICS;

  var STORAGE_BEST = "usol_best_v1";
  var STORAGE_PLAYS = "usol_plays_v1";

  var SIZE_MIN = cfg.sizeMin;
  var SIZE_MAX = cfg.sizeMax;

  var el = {};
  var state = {
    phase: "idle",
    mode: "classic",
    round: 0,
    boardW: 0,
    boardH: 0,
    player: { x: 0.5, y: 0.5, size: 0.3 },
    startPos: { x: 0.5, y: 0.5 },
    target: { x: 0.5, y: 0.5, size: cfg.targetSizeRatio },
    view: { scale: 1, panX: 0, panY: 0 },
    targetScreen: { x: 0.5, y: 0.5, size: cfg.targetSizeRatio },
    sizeLocked: false,
    roundScores: [],
    dragging: false,
    dragOffset: { x: 0, y: 0 },
    totalRounds: cfg.roundsPerGame,
    timerId: null,
    timeLeft: 0,
    seed: 0
  };

  function rand() {
    state.seed = (state.seed * 1664525 + 1013904223) % 4294967296;
    return state.seed / 4294967296;
  }

  function roundsFor(mode) {
    if (cfg.modeRounds && cfg.modeRounds[mode]) return cfg.modeRounds[mode];
    return cfg.roundsPerGame;
  }

  function cache() {
    el.board = document.getElementById("game-board");
    el.sun = document.getElementById("game-sun");
    el.ghost = document.getElementById("game-ghost");
    el.flag = el.board ? el.board.querySelector(".board__flag") : null;
    el.lines = el.board ? el.board.querySelector(".board__lines") : null;
    el.start = document.getElementById("board-start");
    el.startBtn = document.getElementById("btn-start");
    el.startQuick = document.getElementById("btn-start-quick");
    el.sizeRange = document.getElementById("size-range");
    el.confirm = document.getElementById("btn-confirm");
    el.reset = document.getElementById("btn-reset");
    el.roundTrack = document.getElementById("round-track");
    el.roundLabel = document.getElementById("round-label");
    el.timerPill = document.getElementById("timer-pill");
    el.timerValue = document.getElementById("timer-value");
    el.statRound = document.getElementById("stat-round");
    el.statBest = document.getElementById("stat-best");
    el.statPlays = document.getElementById("stat-plays");
    el.statMode = document.getElementById("stat-mode");
    el.guideToggle = document.getElementById("guide-toggle");
    el.result = document.getElementById("result-overlay");
    el.toast = document.getElementById("toast");
    el.shareCanvas = document.getElementById("share-canvas");
    el.banner = document.getElementById("challenge-banner");
    el.bannerText = document.getElementById("challenge-banner-text");
    el.bannerAccept = document.getElementById("challenge-accept");
    el.bannerClose = document.getElementById("challenge-close");
  }

  function measure() {
    if (!el.board) return;
    var rect = el.board.getBoundingClientRect();
    state.boardW = rect.width || 1;
    state.boardH = rect.height || state.boardW / 1.5;
  }

  function clampPlayer() {
    var p = state.player;
    var padH = (p.size * state.boardH) / 2;
    var padWx = padH / state.boardW;
    var padHy = (p.size * state.boardH) / 2 / state.boardH;
    p.x = Math.min(1 - padWx, Math.max(padWx, p.x));
    p.y = Math.min(1 - padHy, Math.max(padHy, p.y));
  }

  function render() {
    if (!el.board) return;
    var p = state.player;
    var diameter = p.size * state.boardH;
    el.sun.style.width = diameter + "px";
    el.sun.style.height = diameter + "px";
    el.sun.style.left = p.x * state.boardW + "px";
    el.sun.style.top = p.y * state.boardH + "px";

    var v = state.view;
    var transform =
      "translate(" + (v.panX * 100).toFixed(3) + "%, " + (v.panY * 100).toFixed(3) + "%) scale(" + v.scale.toFixed(4) + ")";
    if (el.flag) el.flag.style.transform = transform;
    if (el.lines) el.lines.style.transform = transform;

    var ts = state.targetScreen;
    var targetDiameter = ts.size * state.boardH;
    el.ghost.style.width = targetDiameter + "px";
    el.ghost.style.height = targetDiameter + "px";
    el.ghost.style.left = ts.x * state.boardW + "px";
    el.ghost.style.top = ts.y * state.boardH + "px";
  }

  function renderRounds() {
    el.roundTrack.innerHTML = "";
    for (var i = 0; i < state.totalRounds; i += 1) {
      var dot = document.createElement("span");
      dot.className = "round-dot";
      if (i < state.roundScores.length) dot.classList.add("is-done");
      if (i === state.round && state.phase === "playing") dot.classList.add("is-active");
      el.roundTrack.appendChild(dot);
    }
  }

  function updateStats() {
    var roundText = Math.min(state.round + 1, state.totalRounds) + " / " + state.totalRounds;
    el.statRound.textContent = roundText;
    if (el.roundLabel) el.roundLabel.textContent = roundText;
    el.statBest.textContent = readBest() + "%";
    el.statPlays.textContent = String(readPlays());
    var modeKey = "mode." + state.mode + ".title";
    el.statMode.textContent = i18n.t(modeKey);
  }

  function readBest() {
    try {
      return parseInt(window.localStorage.getItem(STORAGE_BEST) || "0", 10) || 0;
    } catch (err) {
      return 0;
    }
  }

  function readPlays() {
    try {
      return parseInt(window.localStorage.getItem(STORAGE_PLAYS) || "0", 10) || 0;
    } catch (err) {
      return 0;
    }
  }

  function bumpPlays() {
    try {
      window.localStorage.setItem(STORAGE_PLAYS, String(readPlays() + 1));
    } catch (err) {
      /* ignore */
    }
  }

  function saveBest(value) {
    if (value > readBest()) {
      try {
        window.localStorage.setItem(STORAGE_BEST, String(value));
      } catch (err) {
        /* ignore */
      }
    }
  }

  /* Presents the flag at a random scale and offset. The flag's centre is the
     answer, so it must stay fully visible: the pan room is bounded by the scale. */
  function applyView() {
    var v = cfg.view || { minScale: 0.72, maxScale: 0.94 };
    var min = v.minScale != null ? v.minScale : 0.72;
    var max = v.maxScale != null ? v.maxScale : 0.94;
    var scale = min + rand() * (max - min);
    var room = (1 - scale) / 2;

    state.view.scale = scale;
    state.view.panX = (rand() * 2 - 1) * room;
    state.view.panY = (rand() * 2 - 1) * room;

    state.targetScreen.x = 0.5 + state.view.panX;
    state.targetScreen.y = 0.5 + state.view.panY;
    state.targetScreen.size = state.target.size * scale;
  }

  function configureRound() {
    var index = state.round;
    state.target.x = 0.5;
    state.target.y = 0.5;
    state.target.size = cfg.targetSizeRatio;
    state.sizeLocked = false;

    applyView();

    /* The sun always starts clearly off target, so a passive player cannot
       score highly by doing nothing. */
    var distance = 0.2 + rand() * 0.18;
    var angle = rand() * Math.PI * 2;
    state.player.x = state.targetScreen.x + Math.cos(angle) * distance;
    state.player.y = state.targetScreen.y + Math.sin(angle) * distance;

    if (index === 0 && state.totalRounds > 1) {
      state.sizeLocked = true;
      state.player.size = state.targetScreen.size;
    } else {
      var error = 0.12 + rand() * 0.38;
      var sign = rand() < 0.5 ? -1 : 1;
      state.player.size = state.targetScreen.size * (1 + sign * error);
    }

    state.player.size = score.clamp(state.player.size, SIZE_MIN, SIZE_MAX);
    clampPlayer();
    state.startPos = { x: state.player.x, y: state.player.y };

    el.sizeRange.min = String(SIZE_MIN);
    el.sizeRange.max = String(SIZE_MAX);
    el.sizeRange.step = "0.002";
    el.sizeRange.value = String(state.player.size);
    el.sizeRange.disabled = state.sizeLocked;

    el.board.classList.remove("show-answer");
    el.board.classList.toggle("show-guides", false);

    setConfirmLabel(i18n.t("controls.confirm"));
    el.confirm.disabled = false;
    el.reset.disabled = false;
    startTimerIfNeeded();
    render();
    renderRounds();
    updateStats();
  }

  function dailySeed() {
    var d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function startTimerIfNeeded() {
    stopTimer();
    var timed = state.mode === "timed";
    if (!timed) {
      el.timerPill.hidden = true;
      return;
    }
    el.timerPill.hidden = false;
    state.timeLeft = cfg.roundTimeSeconds;
    el.timerValue.textContent = state.timeLeft + "s";
    el.timerPill.classList.remove("is-low");
    state.timerId = window.setInterval(function () {
      state.timeLeft -= 1;
      el.timerValue.textContent = Math.max(0, state.timeLeft) + "s";
      if (state.timeLeft <= 5) el.timerPill.classList.add("is-low");
      if (state.timeLeft <= 0) {
        stopTimer();
        confirmRound();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function setConfirmLabel(text) {
    var span = el.confirm.querySelector("[data-btn-label]");
    if (span) span.textContent = text;
  }

  function syncModeRadios(mode) {
    document.querySelectorAll('input[name="mode"]').forEach(function (radio) {
      radio.checked = radio.value === mode;
    });
    updateStats();
  }

  function initBanner() {
    if (!el.banner || !el.bannerText) return;
    var params = new URLSearchParams(window.location.search);
    var s = parseInt(params.get("s") || "", 10);
    if (isNaN(s) && typeof window.USOL_SHARED_SCORE === "number") {
      s = window.USOL_SHARED_SCORE;
    }
    if (isNaN(s) || s < 0 || s > 100) return;
    var m = params.get("m") || window.USOL_SHARED_MODE;
    if (m && ["quick", "classic", "timed", "daily"].indexOf(m) >= 0) {
      state.mode = m;
      syncModeRadios(m);
    }
    el.bannerText.textContent = i18n.t("banner.text", { score: s });
    el.banner.hidden = false;
    analytics.track("banner_view", { score: s });
  }

  function startGame(mode) {
    state.mode = mode || state.mode;
    state.totalRounds = roundsFor(state.mode);
    state.round = 0;
    state.roundScores = [];
    state.phase = "playing";
    state.seed = state.mode === "daily" ? dailySeed() : Math.floor(Math.random() * 9000) + 1000;
    el.start.hidden = true;
    el.result.classList.remove("is-open");
    bumpPlays();
    configureRound();
    analytics.track("game_start", { mode: state.mode, rounds: state.totalRounds });
  }

  function confirmRound() {
    if (state.phase !== "playing") return;
    stopTimer();
    state.phase = "round-result";
    var ts = state.targetScreen;
    var inv = 1 / (state.view.scale || 1);
    var pos = score.scorePosition((state.player.x - ts.x) * inv, (state.player.y - ts.y) * inv, {
      widthCm: cfg.flagWidthCm,
      aspect: cfg.flagAspect,
      maxRatio: cfg.maxPositionErrorRatio
    });
    var size = score.scoreSize(state.player.size, ts.size);
    var useSize = !state.sizeLocked;
    var total = useSize
      ? score.totalScore(pos.score, size.score, { position: cfg.positionWeight, size: cfg.sizeWeight })
      : pos.score;

    state.roundScores.push({
      position: pos.score,
      size: useSize ? size.score : null,
      total: total,
      distanceCm: pos.distanceCm
    });

    el.board.classList.add("show-answer");
    el.confirm.disabled = true;
    el.reset.disabled = true;
    analytics.track("round_complete", {
      mode: state.mode,
      round: state.round + 1,
      positionScore: pos.score,
      sizeScore: useSize ? size.score : null,
      total: total,
      distanceCm: Number(pos.distanceCm.toFixed(2)),
      viewScale: Number(state.view.scale.toFixed(3))
    });

    renderRounds();
    updateStats();

    if (state.round + 1 >= state.totalRounds) {
      finishGame();
    } else {
      setConfirmLabel(i18n.t("controls.next"));
      el.confirm.disabled = false;
      state.phase = "between";
    }
  }

  function nextRound() {
    state.round += 1;
    state.phase = "playing";
    configureRound();
  }

  function finishGame() {
    state.phase = "finished";
    var totals = state.roundScores.map(function (r) {
      return r.total;
    });
    var sum = totals.reduce(function (a, b) {
      return a + b;
    }, 0);
    var finalScore = Math.round(sum / totals.length);
    saveBest(finalScore);
    showResult(finalScore);
    analytics.track("game_complete", { mode: state.mode, score: finalScore });
    updateStats();
  }

  function showResult(finalScore) {
    var grade = score.gradeFor(finalScore);
    document.getElementById("result-score-value").textContent = String(finalScore);
    var gradeEl = document.getElementById("result-grade");
    gradeEl.textContent = i18n.t("result.grade." + grade);
    gradeEl.className = "result-card__grade " + (grade === "almost-perfect" || grade === "great" ? "is-good" : grade === "try-again" ? "is-bad" : "is-ok");

    var posAvg = Math.round(
      state.roundScores.reduce(function (a, r) {
        return a + r.position;
      }, 0) / state.roundScores.length
    );
    var sizeRounds = state.roundScores.filter(function (r) {
      return r.size != null;
    });
    var sizeAvg = sizeRounds.length
      ? Math.round(
          sizeRounds.reduce(function (a, r) {
            return a + r.size;
          }, 0) / sizeRounds.length
        )
      : posAvg;
    var lastCm = state.roundScores[state.roundScores.length - 1].distanceCm;
    document.getElementById("result-pos").textContent = posAvg + "%";
    document.getElementById("result-size").textContent = sizeRounds.length ? sizeAvg + "%" : "—";
    document.getElementById("result-total").textContent = finalScore + "%";
    document.getElementById("result-note").textContent = i18n.t("result.note", {
      cm: lastCm.toFixed(1),
      width: cfg.flagWidthCm
    });
    state.finalScore = finalScore;
    renderShareCard();
    el.result.classList.add("is-open");
    el.result.setAttribute("aria-hidden", "false");
  }

  function renderShareCard() {
    if (!el.shareCanvas || !window.USOL_SHARE) return;
    var locale = document.documentElement.lang === "en" ? "en-US" : "es-AR";
    var dateText = "";
    try {
      dateText = new Date().toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
    } catch (err) {
      dateText = "";
    }
    window.USOL_SHARE.renderCard(el.shareCanvas, {
      score: state.finalScore || 0,
      gradeText: i18n.t("result.grade." + score.gradeFor(state.finalScore || 0)),
      modeText: i18n.t("mode." + state.mode + ".title"),
      dateText: dateText,
      siteHost: cfg.siteDomain
    });
  }

  function shareText() {
    return i18n.t("share.text", { score: state.finalScore || 0 });
  }

  function shareLink() {
    if (window.USOL_SHARE) return window.USOL_SHARE.shareUrl(state.finalScore || 0, state.mode);
    return window.location.origin + window.location.pathname;
  }

  function doShareImage() {
    analytics.track("share_click", { channel: "image", score: state.finalScore });
    var text = shareText() + " " + shareLink();
    if (window.USOL_SHARE && el.shareCanvas) {
      window.USOL_SHARE.shareImage(el.shareCanvas, state.finalScore, text).then(function (ok) {
        if (!ok) doShareText();
      });
    } else {
      doShareText();
    }
  }

  function doShareText() {
    var text = shareText();
    var url = shareLink();
    analytics.track("share_click", { channel: "text", score: state.finalScore });
    if (navigator.share) {
      navigator.share({ title: document.title, text: text, url: url }).catch(function () {
        copyShare(text + " " + url);
      });
    } else {
      copyShare(text + " " + url);
    }
  }

  function doDownload() {
    analytics.track("image_download", { score: state.finalScore });
    var ok = window.USOL_SHARE && window.USOL_SHARE.download(el.shareCanvas, state.finalScore);
    toast(ok ? i18n.t("share.downloaded") : i18n.t("share.downloadFail"));
  }

  function doCopy() {
    analytics.track("copy_result", { score: state.finalScore });
    copyShare(shareText() + " " + shareLink());
  }

  function shareX() {
    analytics.track("share_click", { channel: "x", score: state.finalScore });
    var intent = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText()) + "&url=" + encodeURIComponent(shareLink());
    window.open(intent, "_blank", "noopener,noreferrer");
  }

  function copyShare(text) {
    var done = function () {
      toast(i18n.t("toast.copied"));
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
      done();
    } catch (err) {
      toast(i18n.t("toast.shareFail"));
    }
    document.body.removeChild(area);
  }

  var toastTimer = null;
  function toast(message) {
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.classList.add("is-open");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.toast.classList.remove("is-open");
    }, 2200);
  }

  function pointerToNorm(event) {
    var rect = el.board.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };
  }

  function onPointerDown(event) {
    if (state.phase !== "playing") return;
    state.dragging = true;
    el.board.classList.add("is-dragging");
    var point = pointerToNorm(event);
    state.dragOffset.x = state.player.x - point.x;
    state.dragOffset.y = state.player.y - point.y;
    if (el.sun.setPointerCapture) {
      el.sun.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!state.dragging || state.phase !== "playing") return;
    var point = pointerToNorm(event);
    state.player.x = point.x + state.dragOffset.x;
    state.player.y = point.y + state.dragOffset.y;
    clampPlayer();
    render();
    event.preventDefault();
  }

  function onPointerUp() {
    state.dragging = false;
    el.board.classList.remove("is-dragging");
  }

  function onKeyMove(event) {
    if (state.phase !== "playing") return;
    var step = event.shiftKey ? 0.02 : 0.005;
    if (event.key === "ArrowLeft") state.player.x -= step;
    else if (event.key === "ArrowRight") state.player.x += step;
    else if (event.key === "ArrowUp") state.player.y -= step;
    else if (event.key === "ArrowDown") state.player.y += step;
    else return;
    event.preventDefault();
    clampPlayer();
    render();
  }

  function scrollToBoard() {
    if (el.board && typeof el.board.scrollIntoView === "function") {
      el.board.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function bind() {
    el.sun.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.sun.addEventListener("keydown", onKeyMove);
    el.sun.setAttribute("tabindex", "0");
    el.sun.setAttribute("role", "slider");
    el.sun.setAttribute("aria-label", i18n.t("board.drag"));

    el.startBtn.addEventListener("click", function () {
      startGame(state.mode);
    });

    if (el.startQuick) {
      el.startQuick.addEventListener("click", function () {
        startGame("quick");
      });
    }

    document.querySelectorAll("[data-start]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-start") || "quick";
        state.mode = mode;
        syncModeRadios(mode);
        startGame(mode);
        scrollToBoard();
      });
    });

    if (el.bannerAccept) {
      el.bannerAccept.addEventListener("click", function () {
        analytics.track("banner_accept", { mode: state.mode });
        startGame(state.mode);
        scrollToBoard();
      });
    }
    if (el.bannerClose) {
      el.bannerClose.addEventListener("click", function () {
        if (el.banner) el.banner.hidden = true;
      });
    }

    el.confirm.addEventListener("click", function () {
      if (state.phase === "between") nextRound();
      else confirmRound();
    });

    el.reset.addEventListener("click", function () {
      if (state.phase !== "playing") return;
      var sp = state.startPos || { x: 0.5, y: 0.5 };
      state.player.x = sp.x;
      state.player.y = sp.y;
      render();
    });

    el.sizeRange.addEventListener("input", function () {
      if (state.sizeLocked || state.phase !== "playing") return;
      state.player.size = parseFloat(el.sizeRange.value);
      clampPlayer();
      render();
    });

    if (el.guideToggle) {
      el.guideToggle.addEventListener("change", function () {
        el.board.classList.toggle("show-guides", el.guideToggle.checked);
      });
    }

    document.querySelectorAll('input[name="mode"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        state.mode = radio.value;
        updateStats();
        analytics.track("mode_select", { mode: state.mode });
      });
    });

    document.getElementById("result-again").addEventListener("click", function () {
      analytics.track("play_again", { mode: state.mode });
      startGame(state.mode);
    });
    document.getElementById("result-download").addEventListener("click", doDownload);
    document.getElementById("result-share").addEventListener("click", doShareImage);
    document.getElementById("result-copy").addEventListener("click", doCopy);
    document.getElementById("result-share-x").addEventListener("click", shareX);
    document.getElementById("result-challenge-full").addEventListener("click", function () {
      analytics.track("challenge_full", {});
      state.mode = "classic";
      syncModeRadios("classic");
      startGame("classic");
    });
    document.getElementById("result-close").addEventListener("click", function () {
      el.result.classList.remove("is-open");
      el.result.setAttribute("aria-hidden", "true");
    });

    window.addEventListener("resize", function () {
      measure();
      clampPlayer();
      render();
    });

    document.addEventListener("usol:langchange", function () {
      updateStats();
      if (state.phase === "between") setConfirmLabel(i18n.t("controls.next"));
      else setConfirmLabel(i18n.t("controls.confirm"));
      if (el.result.classList.contains("is-open")) renderShareCard();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && el.result.classList.contains("is-open")) {
        el.result.classList.remove("is-open");
        el.result.setAttribute("aria-hidden", "true");
      }
    });
  }

  function init() {
    if (!document.getElementById("game-board")) return;
    cache();
    el.sun.innerHTML = S.svg();
    measure();
    bind();
    updateStats();
    renderRounds();
    render();
    initBanner();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("load", function () {
    measure();
    render();
  });
})();
