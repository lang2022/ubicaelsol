import { ImageResponse } from "@vercel/og";
import React from "react";

export const config = { runtime: "edge" };

const h = React.createElement;
const STATIC_FALLBACK = "https://ubicaelsol.com/assets/img/og-default.png";

function clampScore(value) {
  const n = parseInt(value, 10);
  if (isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function gradeFor(score, lang) {
  const es = [
    [95, "¡Casi perfecto!"],
    [85, "Muy buena precisión"],
    [70, "Buen intento"],
    [50, "Podés mejorar"],
    [0, "Probá otra vez"]
  ];
  const en = [
    [95, "Almost perfect!"],
    [85, "Great precision"],
    [70, "Good attempt"],
    [50, "You can improve"],
    [0, "Try again"]
  ];
  const table = lang === "en" ? en : es;
  for (const row of table) {
    if (score >= row[0]) return row[1];
  }
  return "";
}

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const score = clampScore(searchParams.get("s"));
  const lang = searchParams.get("lang") === "en" ? "en" : "es";
  const grade = gradeFor(score, lang);

  const bands = ["#75aadb", "#ffffff", "#75aadb"];

  try {
    return new ImageResponse(
      h(
        "div",
        {
          style: {
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(160deg, #2f6fb5 0%, #1c4c86 55%, #122f52 100%)",
            fontFamily: "sans-serif",
            color: "#ffffff"
          }
        },
        [
          h(
            "div",
            { key: "brand", style: { fontSize: "34px", letterSpacing: "4px", opacity: 0.85, marginBottom: "10px" } },
            "UBICÁ EL SOL"
          ),
          h(
            "div",
            { key: "score", style: { fontSize: "190px", fontWeight: 800, lineHeight: 1 } },
            `${score}%`
          ),
          h(
            "div",
            { key: "grade", style: { fontSize: "52px", fontWeight: 700, color: "#ffd75e", marginTop: "6px" } },
            grade
          ),
          h(
            "div",
            { key: "flag", style: { display: "flex", flexDirection: "column", width: "440px", height: "120px", borderRadius: "16px", overflow: "hidden", marginTop: "36px" } },
            bands.map((color, i) =>
              h("div", { key: i, style: { flex: 1, background: color } })
            )
          ),
          h(
            "div",
            { key: "url", style: { fontSize: "28px", opacity: 0.7, marginTop: "28px" } },
            "ubicaelsol.com"
          )
        ]
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    return Response.redirect(STATIC_FALLBACK, 302);
  }
}
