/* Ubicá el Sol — Sun of May.
   Geometry measured from the official artwork in assets/img/suns.png:
   32 near-radial rays alternating long/narrow and short/wide, both blunt-tipped,
   and a face measuring 2/5 of the total figure. Drawn from scratch. */

(function () {
  "use strict";

  var CX = 50;
  var CY = 50;

  /* All ray values are in viewBox units, where the outer radius is R_OUT. */
  var M = {
    rays: 32,
    faceRatio: 0.4,
    outerRadius: 48,
    rayStart: 18.6,
    longTip: 48,
    shortTip: 46.6,
    taperBase: 1.075,
    taperPower: 0.65,
    longTipHalf: 0.47,
    shortTipHalf: 0.6,
    wobble: 0.022,
    wobbleFreq: 1.25,
    drift: 0.01,
    fill: "#fcbf49",
    line: "#85340a"
  };

  /* Line work is authored in CSS pixels, not viewBox units: the sun is only
     70-90px wide in game, where unit-based strokes fall below one pixel and the
     face disappears. styles.css enables non-scaling-stroke for these shapes. */
  var STROKE_OUTLINE = 1.0;
  var STROKE_FACE = 1.25;
  var PUPIL = 1.3;
  var R_FACE = M.outerRadius * M.faceRatio;

  function polar(angle, radius) {
    return { x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius };
  }

  function points(list) {
    return list
      .map(function (p) {
        return p.x.toFixed(2) + " " + p.y.toFixed(2);
      })
      .join(" L");
  }

  function rayPolygon(angle, tipR, tipHalf, wobble) {
    var start = M.rayStart;
    var steps = 14;
    var left = [];
    var right = [];
    var i;
    for (i = 0; i <= steps; i += 1) {
      var t = i / steps;
      var r = start + (tipR - start) * t;
      var sweep = wobble * Math.sin(Math.PI * 2 * M.wobbleFreq * t) + M.drift * t * t;
      var a = angle + sweep;
      var half = M.taperBase * Math.pow(1 - t, M.taperPower) + tipHalf;
      var nx = -Math.sin(a) * half;
      var ny = Math.cos(a) * half;
      var px = CX + Math.cos(a) * r;
      var py = CY + Math.sin(a) * r;
      left.push({ x: px + nx, y: py + ny });
      right.push({ x: px - nx, y: py - ny });
    }
    right.reverse();
    return "M" + points(left) + " L" + points(right) + " Z";
  }

  function rays() {
    var out = "";
    var i;
    for (i = 0; i < M.rays; i += 1) {
      var angle = (Math.PI * 2 * i) / M.rays - Math.PI / 2;
      var isLong = i % 2 === 0;
      var tipR = isLong ? M.longTip : M.shortTip;
      var tipHalf = isLong ? M.longTipHalf : M.shortTipHalf;
      var wobble = isLong ? 0 : M.wobble;
      out += '<path d="' + rayPolygon(angle, tipR, tipHalf, wobble) + '"/>';
      var cap = polar(angle, tipR - tipHalf);
      out +=
        '<circle cx="' + cap.x.toFixed(2) + '" cy="' + cap.y.toFixed(2) +
        '" r="' + tipHalf + '"/>';
    }
    return out;
  }

  function eye(cx) {
    var y = -3.3;
    return (
      '<path d="M' + (cx - 2.9) + " " + y +
      " Q" + cx + " " + (y - 3.2) + " " + (cx + 2.9) + " " + y +
      " Q" + cx + " " + (y + 2.1) + " " + (cx - 2.9) + " " + y +
      '" fill="none"/>' +
      '<circle cx="' + cx + '" cy="' + (y - 0.4) + '" r="' + PUPIL + '" fill="' + M.line +
      '" stroke="none"/>'
    );
  }

  function face() {
    return (
      '<path d="M-11.2 -7.4 Q-8.4 -8.6 -5.4 -7.0" fill="none"/>' +
      '<path d="M5.4 -7.0 Q8.4 -8.6 11.2 -7.4" fill="none"/>' +
      eye(-6.6) +
      eye(6.6) +
      '<path d="M0 -1.2 L0 1.6" fill="none"/>' +
      '<path d="M-0.5 1.6 Q-2.5 2.9 -3.7 1.4" fill="none"/>' +
      '<path d="M0.5 1.6 Q2.5 2.9 3.7 1.4" fill="none"/>' +
      '<path d="M-3.7 4.6 Q0 6.4 3.7 4.6" fill="none"/>' +
      '<path d="M-3.0 6.7 Q0 8.0 3.0 6.7" fill="none" opacity="0.85"/>'
    );
  }

  function sunSVG() {
    return (
      '<svg viewBox="0 0 100 100" role="img" aria-hidden="true" focusable="false">' +
      '<g fill="' + M.fill + '" stroke="' + M.line + '" stroke-width="' + STROKE_OUTLINE + '" stroke-linejoin="round" vector-effect="non-scaling-stroke">' +
      rays() +
      "</g>" +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + R_FACE.toFixed(2) +
      '" fill="' + M.fill + '" stroke="' + M.line + '" stroke-width="' + STROKE_OUTLINE + '" vector-effect="non-scaling-stroke"/>' +
      '<g transform="translate(' + CX + ' ' + CY + ')" fill="none" stroke="' + M.line + '" stroke-width="' + STROKE_FACE + '" stroke-linecap="round" vector-effect="non-scaling-stroke">' +
      face() +
      "</g>" +
      "</svg>"
    );
  }

  window.USOL_SUN = { svg: sunSVG, metrics: M, faceRatio: M.faceRatio };
})();
