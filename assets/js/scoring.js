/* Ubicá el Sol — scoring rules.
   Position is measured in real centimetres on the flag surface, so a vertical
   and a horizontal error of the same physical size score the same. */

(function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* dx, dy are offsets in flag-normalised units (1 = flag width / flag height).
     opts: { widthCm, aspect, maxRatio } */
  function scorePosition(dx, dy, opts) {
    var options = opts || {};
    var widthCm = options.widthCm || 90;
    var aspect = options.aspect || 1.6;
    var maxCm = (options.maxRatio || 0.5) * widthCm;

    var dxCm = dx * widthCm;
    var dyCm = (dy * widthCm) / aspect;
    var distance = Math.sqrt(dxCm * dxCm + dyCm * dyCm);

    return {
      distanceCm: distance,
      score: Math.round(100 * (1 - clamp(distance / maxCm, 0, 1)))
    };
  }

  function scoreSize(playerDiameter, targetDiameter) {
    if (!(targetDiameter > 0) || !(playerDiameter > 0)) {
      return { error: 1, score: 0 };
    }
    var error = Math.abs(playerDiameter - targetDiameter) / targetDiameter;
    return {
      error: error,
      score: Math.round(100 * (1 - clamp(error, 0, 1)))
    };
  }

  function totalScore(positionScore, sizeScore, weights) {
    var w = weights || { position: 0.7, size: 0.3 };
    var total = w.position * positionScore + w.size * sizeScore;
    return Math.round(clamp(total, 0, 100));
  }

  function gradeFor(score) {
    if (score >= 95) return "almost-perfect";
    if (score >= 85) return "great";
    if (score >= 70) return "good";
    if (score >= 50) return "keep-trying";
    return "try-again";
  }

  window.USOL_SCORE = {
    clamp: clamp,
    scorePosition: scorePosition,
    scoreSize: scoreSize,
    totalScore: totalScore,
    gradeFor: gradeFor
  };
})();
