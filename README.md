# Smart Air Fryer Assistant

AtelierKitchen Smart Air Fryer Assistant is a responsive, accessible HTML5 coursework app for planning air fryer meals.

## Project structure

- `index.html` contains the semantic page structure.
- `styles.css` contains the responsive visual system.
- `app.js` contains the cooking plan interaction.
- `data/recipes.json` contains AJAX-loaded recipe presets.
- `manifest.json` and `service-worker.js` contain the PWA setup.
- `docs/member-a-report-notes.md` contains report evidence notes for Member A.

## Coursework focus

The project is designed to demonstrate responsive layout, local browser storage, semantic HTML5 sections, form interaction, AJAX recipe loading, PWA support, semantic recipe annotations, and WCAG-oriented accessibility checks.

## Local preview

Serve the folder from a local web server so AJAX and the service worker use normal browser rules:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

This static app can be deployed with GitHub Pages by publishing the `main` branch from the repository root.

## Validation

Before submission, validate the deployed URL with:

- W3C HTML Validator: https://validator.w3.org/
- W3C CSS Validator: https://jigsaw.w3.org/css-validator/
- Lighthouse in Chrome DevTools for accessibility and PWA evidence.
