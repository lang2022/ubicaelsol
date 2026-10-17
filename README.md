# Ubicá el Sol

Juego de precisión web en español e inglés. El jugador arrastra y redimensiona el Sol de Mayo sobre la bandera argentina y busca la posición más cercana a la real. El resultado se comparte como reto.

Sitio en producción: <https://ubicaelsol.com>

## Puesta en marcha

No hay build step: el sitio es HTML estático. Sólo necesitás Node.js para las funciones de servidor.

```bash
git clone https://github.com/lang2022/ubicaelsol.git
cd ubicaelsol
npm install
```

### Servidor local

```bash
python -m http.server 8000
```

Abrí <http://127.0.0.1:8000/>.

Esto sirve los archivos estáticos. Las rutas dinámicas (`/r/<score>`, `/api/og`) no funcionan aquí porque no ejecuta las funciones de Vercel.

### Servidor local completo (con funciones)

Requiere el CLI de Vercel y una cuenta con acceso al proyecto:

```bash
npm i -g vercel
vercel login
vercel dev
```

## Qué es cada cosa

```
index.html, *.html          páginas en español
en/                         páginas en inglés
assets/js/config.js         configuración del sitio (dominio, modos, ads, analítica)
assets/js/game.js           bucle de juego, rondas, puntuación en pantalla
assets/js/scoring.js        cálculo de puntaje por posición y tamaño
assets/js/sun.js            geometría del Sol de Mayo (SVG)
assets/js/share.js          genera la tarjeta de resultado en canvas
assets/js/i18n.js           traducciones es/en
assets/js/consent.js        banner de consentimiento
assets/js/ads.js            carga de AdSense (desactivada por defecto)
assets/js/analytics.js      eventos y cola local
api/og.js                   imagen OG dinámica con el puntaje (Edge Function)
api/share.js                renderiza /r/<score> con el reto precargado
tools/make_og.py            genera las imágenes OG y los iconos
tools/gsc-report.mjs        reporte de Google Search Console (requiere credenciales)
vercel.json                 cabeceras, caché y rewrites
```

## Configuración

Editá `assets/js/config.js` antes de desplegar en tu propio dominio:

```js
siteDomain: "ubicaelsol.com",
siteUrl: "https://ubicaelsol.com",
```

Opcionales:

- `gaMeasurementId` — vacío desactiva Google Analytics.
- `adsEnabled` y `adsenseClient` — por defecto `false` / `""`; no se carga ningún anuncio hasta que se completen y el visitante acepte el consentimiento.
- `adsShowPlaceholder` — en `false` oculta el hueco cuando no hay anuncios.
- `shareRoute` — en `true` los enlaces de reto usan `/r/<score>`.

Si activás AdSense, agregá un `ads.txt` en la raíz con tu Publisher ID real.

## Imágenes OG regeneradas

Las imágenes de `assets/img/` están versionadas. Para regenerarlas hace falta Python y Pillow:

```bash
pip install pillow
python tools/make_og.py
```

## Despliegue

```bash
npx vercel deploy --prod
```

El sitio es estático; no hay comando de build. Vercel sirve los archivos y ejecuta `api/` como Edge Functions.

Después del deploy seguí `上线验证清单.md`.

## Reportes de Search Console

El script no incluye credenciales. Usá un archivo de service account fuera del repo:

```bash
node tools/gsc-report.mjs --site=https://ubicaelsol.com/ --key=./service-account.json --days=7
```

También acepta las variables `GSC_SITE_URL`, `GSC_KEY_FILE` y `GSC_DAYS`.

## Stack

JavaScript sin framework en el cliente, Canvas y SVG para el dibujo, Vercel Edge Functions en `@vercel/og` y React. Sin base de datos: el puntaje vive en la URL.

## Licencia

Uso libre. La bandera y el Sol de Mayo siguen siendo símbolos oficiales de la República Argentina.