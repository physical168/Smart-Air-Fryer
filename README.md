# Smart Air Fryer Assistant

Atelier Kitchen Smart Air Fryer Assistant is a responsive, accessible HTML5 coursework app for one-tap air fryer presets on ready-made foods.

**Figma design**: [J1JS0zMGcs8JTFCNvvDR7l](https://www.figma.com/design/J1JS0zMGcs8JTFCNvvDR7l/Untitled?node-id=0-1)

## Screens

| View | Figma frame | Features |
|------|-------------|----------|
| Home | `36:2` | Search, quick actions, food cards, chef tip |
| Detail | `36:152` / `36:253` | Temperature & duration, favorites, ratings, shopping CTA |
| Shopping list | `36:409` | Checkable inventory, generate from preset |
| History | `36:554` | Saved cooks, PWA status |

## Project structure

- `index.html` — semantic multi-view shell
- `styles.css` — Figma design tokens and layout
- `app.js` — routing, AJAX recipes, `localStorage`, interactions
- `data/recipes.json` — preset foods and shopping templates
- `manifest.json` / `service-worker.js` — PWA (theme `#ff7043`, offline cache)

## Eight-commit build (suggested messages)

1. `chore: scaffold Figma design tokens and multi-view app shell`
2. `feat: add global header, bottom nav, and view routing`
3. `feat(ui): implement home screen layout from Figma`
4. `feat: home search, recipe cards, and navigation to detail`
5. `feat: detail screen cooking parameters and save preset`
6. `feat: add cooking feedback and rating on detail screen`
7. `feat: shopping list screen with interactive inventory`
8. `feat: history screen, PWA polish, and accessibility pass`

## Try it on your computer

Do **not** open `index.html` by double-clicking (the browser blocks recipes and install).

```bash
cd Smart-Air-Fryer
python -m http.server 8000
```

Then open **http://localhost:8000** in Chrome or Edge.  
After code changes, use a hard refresh (`Ctrl+Shift+R`) so you do not keep an old cached copy.

## Put it online with GitHub Pages

Best for coursework: teachers open one link, and PWA install works over HTTPS.

1. Push this project to GitHub (repo root should contain `index.html`).
2. In the repo: **Settings → Pages**.
3. **Source**: Deploy from a branch → **main** → folder **/ (root)** → Save.
4. Wait 1–2 minutes, then open:  
   `https://<your-username>.github.io/<repo-name>/`
5. Open **History** and tap **Install app** (Chrome / Edge on the live URL).

**Tip:** Put that Pages URL in your README and report. Run Lighthouse (PWA, Accessibility) on the live URL.

## Coursework focus

Responsive layout, semantic HTML5, form interaction, AJAX (`recipes.json`), `localStorage` (presets, ratings, shopping list), PWA, and WCAG-oriented patterns (skip link, labels, `aria-live`, 44px targets, focus styles).

## Web technologies (course rubric)

This project is a kitchen preset assistant — it does **not** need maps, media playback, or drag-and-drop. The table below states what the rubric lists and whether this repo uses it.

| Topic | Used? | Where / notes |
|-------|:-----:|---------------|
| **Map / Geolocation API** | No | No map embed, `navigator.geolocation`, or location-based features. |
| **Audio / Video** | No | No `<audio>`, `<video>`, or Media APIs — only static images (e.g. recipe hero photos). |
| **Form** | **Yes** | Home search: `<form id="home-search-form">` with `type="search"`. Detail: number inputs (temperature, duration), `<fieldset>` / star ratings, `<textarea>`, and save actions (wired in `app.js`). Shopping list uses checkbox inputs. |
| **Semantic annotations** (RDFa, Microdata, Microformat) | No | No `itemscope` / `itemprop`, RDFa, or h-card markup. Structure uses **semantic HTML5** (`<main>`, `<section>`, `<article>`, `<nav>`, `<aside>`) plus **ARIA** where needed — not machine-readable schema vocabularies. |
| **Drag and Drop** | No | List order is fixed; shopping items are toggled/deleted with buttons, not HTML5 drag-and-drop. |
| **AJAX** | **Yes** | `fetch("data/recipes.json")` in `app.js` loads presets without a full page reload; search filters cards client-side after load. |
| **PWA** (Progressive Web Application) | **Yes** | `manifest.json`, `service-worker.js` (cache + offline), `theme-color`, install UI on History (`beforeinstallprompt` / Safari “Add to Home Screen” copy). Deploy over HTTPS (e.g. GitHub Pages) for install and Lighthouse PWA checks. |

**Summary for reports:** implement **Form**, **AJAX**, and **PWA**; explicitly note **Map/Geolocation**, **Audio/Video**, **RDFa/Microdata/Microformat**, and **Drag and Drop** as out of scope for this app (with brief justification above).

## Validation

Validate the **deployed** URL (or upload local files) after each release:

| Check | Tool | What to validate |
|-------|------|------------------|
| HTML | [W3C Nu Html Checker](https://validator.w3.org/nu/) | Upload `index.html` or paste your GitHub Pages URL |
| CSS | [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) | **Validate by URI**: `https://your-site/styles.css` (or upload `styles.css`) |

Local `index.html` + `styles.css` were checked against these services (0 HTML errors, 0 CSS errors on the checked build).

- Chrome Lighthouse (Accessibility, PWA)

## Other hosting

Any static host (Netlify, Vercel, school server) works the same way: publish the folder that contains `index.html`, `app.js`, and `data/recipes.json`.
