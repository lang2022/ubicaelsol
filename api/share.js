export const config = { runtime: "edge" };

const SITE = "https://ubicaelsol.com";
const MODES = ["quick", "classic", "timed", "daily"];

function clampScore(value) {
  const n = parseInt(value, 10);
  if (isNaN(n)) return null;
  return Math.min(100, Math.max(0, n));
}

function esc(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function texts(score, lang) {
  if (lang === "en") {
    return {
      title: `I scored ${score}% on Ubicá el Sol`,
      description: "Can you beat my precision? Play the free challenge.",
      note: "Opening the challenge…"
    };
  }
  return {
    title: `Saqué ${score}% en Ubicá el Sol`,
    description: "¿Podés superar mi precisión? Probá el reto gratis.",
    note: "Abriendo el desafío…"
  };
}

export default async function handler(req) {
  const url = new URL(req.url);
  const score = clampScore(url.searchParams.get("score"));
  if (score === null) {
    return Response.redirect(SITE + "/", 302);
  }
  const mode = MODES.includes(url.searchParams.get("m")) ? url.searchParams.get("m") : "quick";
  const lang = url.searchParams.get("lang") === "en" ? "en" : "es";
  const t = texts(score, lang);
  const image = `${SITE}/api/og?s=${score}&m=${mode}&lang=${lang}`;
  const gameUrl = `/?s=${score}&m=${mode}`;

  try {
    const res = await fetch(new URL("/index.html", req.url));
    let html = await res.text();
    html = html
      .replace(/<head>/i, `<head>\n<base href="${SITE}/" />`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(t.title)}</title>`)
      .replace(/<meta property="og:title" content="[^"]*"[^>]*>/, `<meta property="og:title" content="${esc(t.title)}">`)
      .replace(/<meta property="og:description" content="[^"]*"[^>]*>/, `<meta property="og:description" content="${esc(t.description)}">`)
      .replace(/<meta property="og:image" content="[^"]*"[^>]*>/, `<meta property="og:image" content="${image}">`)
      .replace(/<meta name="twitter:title" content="[^"]*"[^>]*>/, `<meta name="twitter:title" content="${esc(t.title)}">`)
      .replace(/<meta name="twitter:description" content="[^"]*"[^>]*>/, `<meta name="twitter:description" content="${esc(t.description)}">`)
      .replace(/<meta name="twitter:image" content="[^"]*"[^>]*>/, `<meta name="twitter:image" content="${image}">`)
      .replace(/<link rel="canonical" href="[^"]*"[^>]*>/, `<link rel="canonical" href="${SITE}${gameUrl}">`)
      .replace(
        /(<script src="assets\/js\/config\.js"><\/script>)/,
        `<script>window.USOL_SHARED_SCORE=${score};window.USOL_SHARED_MODE="${mode}";</script>\n$1`
      );
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=600"
      }
    });
  } catch (err) {
    void t.note;
    return Response.redirect(`${SITE}/${gameUrl}`, 302);
  }
}
