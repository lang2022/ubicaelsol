/* Ubicá el Sol — site configuration.
   Update these values when deploying. */

window.USOL_CONFIG = {
  siteName: "Ubicá el Sol",
  siteDomain: "ubicaelsol.com",
  siteUrl: "https://ubicaelsol.com",
  defaultLang: "es",
  gaMeasurementId: "",
  adsEnabled: false,
  adsenseClient: "",
  adsShowPlaceholder: false,
  shareRoute: true,

  roundsPerGame: 3,
  roundsQuick: 1,
  modeRounds: { quick: 1, classic: 3, timed: 3, daily: 3 },

  /* Flag geometry — official IRAM 2002 standard: proportion 5:8 (width:height). */
  flagAspect: 1.6,
  flagWidthCm: 90,

  /* Sun of May: its diameter equals 5/6 of the white stripe height,
     which is 5/18 of the flag height. This is a fixed property of the flag,
     so the target never changes between rounds. */
  targetSizeRatio: 5 / 18,

  /* Max position error that still scores above zero, as a fraction of flag width. */
  maxPositionErrorRatio: 0.5,

  positionWeight: 0.7,
  sizeWeight: 0.3,

  sizeMin: 0.12,
  sizeMax: 0.45,
  roundTimeSeconds: 20,

  /* The flag is presented at a random scale and offset each round, so the centre
     of the board is never the centre of the flag. The flag itself never changes. */
  view: {
    minScale: 0.72,
    maxScale: 0.94
  }
};
