# Member A Report Notes

## Role scope

Member A owns the front-end structure, responsive layout, accessibility engineering, and validation evidence for the Smart Air Fryer Assistant.

## Implemented mandatory requirements

- Responsive interface using HTML, CSS, and JavaScript.
- Browser storage through `localStorage` for saved cooking preferences.
- HTML5 semantic structure with `header`, `nav`, `main`, `section`, `article`, `aside`, `form`, and `footer`.

## Implemented additional requirements

- Form: the cooking preference form collects ingredient, portion, texture, oil preference, dietary notes, and optional notes.
- AJAX: recipe presets load from `data/recipes.json` with `fetch()`.
- PWA: `manifest.json`, `service-worker.js`, and an app icon provide install/offline foundations.
- Semantic annotations: recipe cards use `schema.org/Recipe` microdata.

## Accessibility evaluation plan

Run Lighthouse after deployment and record:

- Accessibility score.
- Best practices score.
- Any contrast, label, focus, or ARIA warnings.
- Fixes applied after the first scan.

Manual WCAG checks to document:

- Keyboard access for navigation, form controls, and submit flow.
- Visible focus indicator on links, buttons, inputs, and selects.
- Form labels and error text associations.
- Sufficient color contrast for text and controls.
- Announced dynamic cooking plan and recipe loading regions.

## Code validity evaluation plan

Use the W3C validators after deployment:

- HTML validator: https://validator.w3.org/
- CSS validator: https://jigsaw.w3.org/css-validator/

Record the final result as "0 errors" only after the deployed URL has been checked.

## Carbon footprint estimate plan

For the final report, estimate the footprint of the development and test run with CodeCarbon or an equivalent library. Include:

- Tool name and version.
- Machine type.
- Measured command or session duration.
- Estimated emissions in kg CO2eq.
- Short explanation that the app itself is static and lightweight.

## AI usage notes

AI assistance was used to plan the Member A scope, draft semantic HTML/CSS/JavaScript structure, identify accessibility checks, and organize report evidence. All generated code should be reviewed by the team before final submission.

## Commit mapping template

| Commit ID | Feature or fix |
| --- | --- |
| `d430f4c` | Initialize semantic HTML app shell |
| `f41d8b6` | Add responsive dashboard layout |
| `6845f15` | Implement accessible cooking preference form |
| `062df43` | Persist cooking preferences with localStorage |
| `4359ac3` | Load recipe presets with fetch |
| `5a12e4c` | Add progressive web app support |
| `8822f8b` | Add recipe microdata and accessibility states |
| Final docs commit | Document validation and reporting checklist |
