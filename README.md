# Thames Assurance — Live Demo (static)

Clickable screen-to-screen prototype for partner demos. **Fully static** (HTML/CSS/JS + assets). No Node/build step.

## Quick start (local)

```bash
# macOS / Linux
./start.sh          # http://localhost:8765/

# Windows (CONVERGENCE)
start.bat           # http://localhost:8765/
```

Or from this folder:

```bash
python3 -m http.server 8765 --bind 0.0.0.0
```

Open **http://localhost:8765/** → Login → **Sites Portfolio** → Map / Region / Site GT → **full left rail** destinations.

## Share / host publicly

1. Zip this whole `live-demo/` folder (or use `thames-assurance-live-demo.zip` from the pack root).
2. Drop on **Netlify**, **GitHub Pages**, **Cloudflare Pages**, S3+CloudFront, or any static host.
3. Root file is `index.html` (redirects to Login). All links are **relative** — works at any base path if you keep the folder structure.

Tailscale: run `./start.sh` on a machine in the tailnet and share `http://<tailscale-ip>:8765/`.

> Prefer a static server over `file://` — Leaflet map tiles and some browsers restrict local file scripts. Relative paths are hosting-safe.

## Route map

| From | Click | To |
|------|-------|-----|
| Login | Sign in / SSO / Enter | **Sites Portfolio** (`00-sites-portfolio.html`) |
| Sites Portfolio | Beckton column / Open site | Beckton GT |
| Sites Portfolio | Oxford column / Open site | Oxford GT |
| Sites Portfolio | Crossness · Mogden · Hogsmill · Deephams | Demo overview only (toast) |
| Sites Portfolio rail | Portfolio (active) · Map · Regions · … · Log out | wired |
| Map Home | London card / London polygon | London region |
| Map Home | Thames Valley & HC card / TV polygon | TV&HC region |
| Map Home | Beckton / Oxford pin labels (interactive) | Site GT |
| Map / Region rail | Portfolio · Map · Regions · Site locations · Programme · Assurance · Reports · Alerts | wired (site samples → Beckton when no site context) |
| London region | Beckton row / Open site / pin | Beckton GT |
| TV&HC region | Oxford row / Open site / pin | Oxford GT |
| Site rail / crumbs | **All sites** / **Portfolio** | Sites Portfolio |
| **Site rail (Beckton · Oxford)** | **Site Dashboard · Map · Project team · Site visuals · Programme · Assurance · Reports · Alerts · Log out** | **All wired** |
| Beckton GT | NCR-00471 | NCR decision |
| Beckton GT | Costain (Lead Contractor) | Costain profile |
| Oxford GT | CMDP | CMDP profile |
| Site visuals | Closer look (CAM-*-02) | Cam detail |
| Reports | Open preview | Report preview |
| Assurance hub | NCR-00471 | NCR decision |
| Any | Log out | Login |

Back buttons and breadcrumbs (Map / region / site) are wired where present.

**Full site rail is wired** on every Beckton and Oxford screen (dashboard, visuals, programme, assurance, reports, alerts, NCR, contractor, cam detail, report preview). Hooks use `data-demo-nav` / `data-demo-site` plus text-match fallback in `nav.js`.

## Layout note

Screens are designed at **1440×900**. Use browser zoom or fullscreen if the artboard letterboxes. Yellow **Live demo** badge is intentional.

## Files

- `index.html` — entry
- `screens/00-sites-portfolio.html` — post-login **Sites Portfolio** landing (6 columns)
- `screens/*.html` — demo copies of render screens (editable links; pack-root PNGs untouched)
- `nav.js` / `nav.css` — shared click wiring + affordances
- `screens/cctv/` · `tw-logo-128.png` · `bg-shared-dark.jpg` — assets

Source of truth for exports remains `../render/`. This folder is the interactive demo only.
