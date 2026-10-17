#!/usr/bin/env node
/**
 * Google Search Console report (no external dependencies).
 *
 * Usage:
 *   node tools/gsc-report.mjs --site=https://ubicaelsol.com/ --key=./service-account.json --days=7
 *
 * Env fallbacks: GSC_SITE_URL, GSC_KEY_FILE, GSC_DAYS, GSC_DIMENSION (query|page|country|device)
 *
 * Note: the service account email must be added as a user in
 * Search Console > Settings > Users and permissions.
 */

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((raw) => {
    const [k, ...rest] = raw.replace(/^--/, "").split("=");
    return [k, rest.join("=") || "true"];
  })
);

const site = args.site || process.env.GSC_SITE_URL;
const keyFile = args.key || process.env.GSC_KEY_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
const days = Number(args.days || process.env.GSC_DAYS || 7);
const dimension = args.dimension || process.env.GSC_DIMENSION || "query";
const rows = Number(args.rows || 20);

if (!site || !keyFile) {
  console.error("Falta configuración.\n");
  console.error("  node tools/gsc-report.mjs --site=https://ejemplo.com/ --key=./service-account.json");
  process.exit(1);
}

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken() {
  const creds = JSON.parse(readFileSync(keyFile, "utf8"));
  if (!creds.client_email || !creds.private_key) {
    throw new Error("El archivo de credenciales no tiene client_email o private_key.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: creds.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    })
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const signature = signer.sign(creds.private_key).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  if (!res.ok) {
    throw new Error(`No se pudo obtener el token (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

function isoDate(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

function pad(value, width) {
  const s = String(value);
  return s.length >= width ? s : s + " ".repeat(width - s.length);
}

function padStart(value, width) {
  const s = String(value);
  return s.length >= width ? s : " ".repeat(width - s.length) + s;
}

async function query(token, body) {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`Consulta fallida (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

(async () => {
  const token = await getAccessToken();
  const endDate = isoDate(1);
  const startDate = isoDate(days);

  const data = await query(token, {
    startDate,
    endDate,
    dimensions: [dimension],
    rowLimit: rows
  });

  console.log(`\nSearch Console — ${site}`);
  console.log(`Rango: ${startDate} → ${endDate} (últimos ${days} días)`);
  console.log(`Dimensión: ${dimension}\n`);

  const list = data.rows || [];
  if (!list.length) {
    console.log("Sin datos en el período. Verificá que el sitio tenga impresiones y esté verificado.");
    return;
  }

  let clicks = 0;
  let impressions = 0;

  console.log(`${pad("valor", 46)}${padStart("clics", 7)}${padStart("impr.", 9)}${padStart("CTR", 8)}${padStart("pos.", 8)}`);
  console.log("-".repeat(78));
  for (const row of list) {
    clicks += row.clicks;
    impressions += row.impressions;
    const label = row.keys[0] || "(no definido)";
    const short = label.length > 44 ? label.slice(0, 43) + "…" : label;
    const ctr = (row.ctr * 100).toFixed(1) + "%";
    console.log(
      pad(short, 46) + padStart(Math.round(row.clicks), 7) + padStart(Math.round(row.impressions), 9) + padStart(ctr, 8) + padStart(row.position.toFixed(1), 8)
    );
  }
  console.log("-".repeat(78));
  console.log(pad("TOTAL (filas mostradas)", 46) + padStart(Math.round(clicks), 7) + padStart(Math.round(impressions), 9));

  const totals = await query(token, { startDate, endDate, dimensions: [] });
  const total = totals.rows && totals.rows[0];
  if (total) {
    console.log(
      `\nTotales del sitio: ${Math.round(total.clicks)} clics · ${Math.round(total.impressions)} impresiones · ${(total.ctr * 100).toFixed(2)}% CTR · pos. media ${total.position.toFixed(1)}`
    );
  }

  console.log("\nSugerencia: repetí con --dimension=page para ver qué páginas reciben más clics.\n");
})().catch((err) => {
  console.error("\nError: " + err.message + "\n");
  process.exit(1);
});
