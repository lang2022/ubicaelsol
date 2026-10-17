/* Ubicá el Sol — result sharing helpers.
   Generates an original share card on canvas (no third-party assets). */

(function () {
  "use strict";

  var cfg = window.USOL_CONFIG;
  var SIZE = 1080;

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* Sun of May: 32 rays alternating thin straight spikes and wavy ribbons,
     face measuring 2/5 of the total figure. */
  function sunMetrics() {
    if (window.USOL_SUN && window.USOL_SUN.metrics) return window.USOL_SUN.metrics;
    return {
      rays: 32, faceRatio: 0.4, outerRadius: 48, rayStart: 18.6, longTip: 48, shortTip: 46.6,
      taperBase: 1.075, taperPower: 0.65, longTipHalf: 0.47, shortTipHalf: 0.6,
      wobble: 0.022, wobbleFreq: 1.25, drift: 0.01, fill: "#fcbf49", line: "#85340a"
    };
  }

  /* Stroke weight follows the reference artwork (0.62 viewBox units) with a
     floor so it never disappears, and a ceiling so it never turns a small sun
     into a dark blob. The card is downloaded at 1080px, so it must look right
     at native size — not at the 190px on-screen thumbnail. */
  var STROKE_UNITS = 0.62;
  var STROKE_FACE_UNITS = 0.8;

  /* Geometry comes from window.USOL_SUN.metrics so the SVG, the canvas card and
     the Open Graph renderer always draw the same sun. */
  function drawSun(ctx, cx, cy, radius) {
    var M = sunMetrics();
    var k = radius / M.outerRadius;
    var face = radius * M.faceRatio;
    var outline = Math.min(2.4, Math.max(0.8, STROKE_UNITS * k));
    var faceW = Math.min(3.0, Math.max(1.0, STROKE_FACE_UNITS * k));

    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = M.fill;
    ctx.strokeStyle = M.line;
    ctx.lineWidth = outline;
    ctx.lineJoin = "round";

    for (var i = 0; i < M.rays; i += 1) {
      var angle = (Math.PI * 2 * i) / M.rays - Math.PI / 2;
      var isLong = i % 2 === 0;
      var tipUnits = isLong ? M.longTipHalf : M.shortTipHalf;
      var tipHalf = tipUnits * k;
      var tipR = (isLong ? M.longTip : M.shortTip) * k;
      var wobble = isLong ? 0 : M.wobble;
      var start = M.rayStart * k;
      var left = [];
      var right = [];
      var s;

      for (s = 0; s <= 14; s += 1) {
        var t = s / 14;
        var r = start + (tipR - start) * t;
        var a = angle + wobble * Math.sin(Math.PI * 2 * M.wobbleFreq * t) + M.drift * t * t;
        var half = (M.taperBase * Math.pow(1 - t, M.taperPower) + tipUnits) * k;
        var mx = Math.cos(a) * r;
        var my = Math.sin(a) * r;
        left.push([mx - Math.sin(a) * half, my + Math.cos(a) * half]);
        right.push([mx + Math.sin(a) * half, my - Math.cos(a) * half]);
      }
      right.reverse();
      ctx.beginPath();
      left.concat(right).forEach(function (p, idx) {
        if (idx === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      var capR = tipR - tipHalf;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * capR, Math.sin(angle) * capR, tipHalf, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, face, 0, Math.PI * 2);
    ctx.fillStyle = M.fill;
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = M.line;
    ctx.lineWidth = faceW;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-11.2 * k, -7.4 * k);
    ctx.quadraticCurveTo(-8.4 * k, -8.6 * k, -5.4 * k, -7.0 * k);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5.4 * k, -7.0 * k);
    ctx.quadraticCurveTo(8.4 * k, -8.6 * k, 11.2 * k, -7.4 * k);
    ctx.stroke();

    [-1, 1].forEach(function (sg) {
      ctx.beginPath();
      ctx.moveTo(sg * 6.6 * k - 2.9 * k, -3.3 * k);
      ctx.quadraticCurveTo(sg * 6.6 * k, -6.5 * k, sg * 6.6 * k + 2.9 * k, -3.3 * k);
      ctx.quadraticCurveTo(sg * 6.6 * k, -1.2 * k, sg * 6.6 * k - 2.9 * k, -3.3 * k);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sg * 6.6 * k, -3.7 * k, 1.3 * k, 0, Math.PI * 2);
      ctx.fillStyle = M.line;
      ctx.fill();
    });

    ctx.beginPath();
    ctx.moveTo(0, -1.2 * k);
    ctx.lineTo(0, 1.6 * k);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.5 * k, 1.6 * k);
    ctx.quadraticCurveTo(-2.5 * k, 2.9 * k, -3.7 * k, 1.4 * k);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0.5 * k, 1.6 * k);
    ctx.quadraticCurveTo(2.5 * k, 2.9 * k, 3.7 * k, 1.4 * k);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3.7 * k, 4.6 * k);
    ctx.quadraticCurveTo(0, 6.4 * k, 3.7 * k, 4.6 * k);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3.0 * k, 6.7 * k);
    ctx.quadraticCurveTo(0, 8.0 * k, 3.0 * k, 6.7 * k);
    ctx.stroke();

    ctx.restore();
  }

  function renderCard(canvas, data) {
    if (!canvas) return;
    var ctx = null;
    try {
      ctx = canvas.getContext("2d");
    } catch (err) {
      ctx = null;
    }
    if (!ctx) return;
    canvas.width = SIZE;
    canvas.height = SIZE;

    var bg = ctx.createLinearGradient(0, 0, 0, SIZE);
    bg.addColorStop(0, "#2f6fb5");
    bg.addColorStop(0.55, "#1c4c86");
    bg.addColorStop(1, "#122f52");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(SIZE * 0.86, SIZE * 0.14, SIZE * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(SIZE * 0.12, SIZE * 0.88, SIZE * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "600 40px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("UBICÁ EL SOL", SIZE / 2, 128);

    var score = String(data.score);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 300px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(score + "%", SIZE / 2, 480);

    ctx.fillStyle = "#ffd75e";
    ctx.font = "700 62px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(data.gradeText || "", SIZE / 2, 578);

    /* Flag drawn at the official 5:8 proportion. */
    var flagW = 496;
    var flagH = 310;
    var flagX = (SIZE - flagW) / 2;
    var flagY = 600;
    ctx.save();
    roundedRect(ctx, flagX, flagY, flagW, flagH, 26);
    ctx.clip();
    var bandH = flagH / 3;
    ctx.fillStyle = "#74acdf";
    ctx.fillRect(flagX, flagY, flagW, bandH);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(flagX, flagY + bandH, flagW, bandH);
    ctx.fillStyle = "#74acdf";
    ctx.fillRect(flagX, flagY + bandH * 2, flagW, bandH);
    drawSun(ctx, SIZE / 2, flagY + bandH * 1.5, (flagH * 5) / 18 / 2);
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "600 34px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    var meta = [data.modeText, data.dateText].filter(Boolean).join("  ·  ");
    ctx.fillText(meta, SIZE / 2, 968);

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "500 30px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(data.siteHost || cfg.siteDomain, SIZE / 2, 1010);
  }

  function fileName(score) {
    return "ubica-el-sol-" + String(score || 0) + ".png";
  }

  function download(canvas, score) {
    if (!canvas) return false;
    try {
      var link = document.createElement("a");
      link.download = fileName(score);
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (err) {
      return false;
    }
  }

  function toBlobAsync(canvas) {
    return new Promise(function (resolve) {
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) {
          resolve(blob);
        }, "image/png");
      } else {
        resolve(null);
      }
    });
  }

  function shareImage(canvas, score, text) {
    return toBlobAsync(canvas).then(function (blob) {
      if (!blob || !navigator.canShare) return false;
      var file = new File([blob], fileName(score), { type: "image/png" });
      if (!navigator.canShare({ files: [file] })) return false;
      return navigator
        .share({ files: [file], text: text })
        .then(function () {
          return true;
        })
        .catch(function () {
          return false;
        });
    });
  }

  function shareUrl(score, mode) {
    if (cfg.shareRoute) {
      return window.location.origin + "/r/" + encodeURIComponent(score) + "?m=" + encodeURIComponent(mode || "quick");
    }
    var base = window.location.origin + window.location.pathname;
    return base + "?s=" + encodeURIComponent(score) + "&m=" + encodeURIComponent(mode || "quick");
  }

  window.USOL_SHARE = {
    renderCard: renderCard,
    download: download,
    shareImage: shareImage,
    shareUrl: shareUrl
  };
})();
