# AI Task Delegation Compass (V2.1)

Static single-page app for deciding between `Autopilot`, `Collaboration`, and `Manual` using three sliders.

## Files

- `index.html` (layout and semantic structure)
- `styles.css` (visual design and responsive styling)
- `app.js` (config, decision logic, live UI behavior)

## Run locally

1. Open `index.html` directly in a browser, or
2. Serve the folder locally:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## V2.1 features

- English-only UI with cleaner modern layout
- Updated branding: **AI Task Delegation Compass**
- Live result card with color-coded states:
  - Autopilot = green/teal
  - Collaboration = blue
  - Manual = amber
- Live **Why this result?** explanation sentence
- "What do these results mean?" modal with all three mode definitions
- Presets:
  - Typical Autopilot
  - Typical Collaboration
  - Typical Manual
- Reset button with centered defaults:
  - Human baseline time = `60`
  - Probability of success = `50`
  - AI process time = `60`

## Content/UX update

- Replaced slider helper text with clearer guidance for each input.
- Added accessible `(i)` tooltip buttons next to slider labels with expanded explanations.
- Added a compact expandable **How to use this tool** section.
- Decision logic, thresholds, presets, slider defaults/ranges, and URL state behavior were not changed.

## Share link behavior update

- Defaults (`60/50/60`) now keep a clean URL with no query string.
- Non-default state uses short params only: `?h=...&p=...&a=...`.
- Backward compatibility is preserved for old links (`human/prob/ai`) on load.
- URL writes are debounced (300ms) while dragging sliders to reduce noisy updates.
- Added a **Copy share link** button that copies the canonical current URL.

## Shareable URL state

Slider state is synced to query params:

`?h=90&p=80&a=10`

Behavior:

- On load, the app reads both short (`h/p/a`) and legacy (`human/prob/ai`) params (short wins if both exist).
- When values are at defaults (`60/50/60`), the URL stays clean with no query string.
- While dragging sliders, URL updates are debounced (300ms) to reduce noisy changes.
- Presets and reset still update the URL via `history.replaceState` without reloading.

## Decision logic

Logic remains functionally identical to V1 and is kept in the top `CONFIG` object in `app.js`.

Time buckets:

- Fast: `< 15`
- Medium: `15-45`
- Long: `> 45`

Probability buckets:

- `0-20`: Unlikely
- `21-40`: Doubtful
- `41-60`: Neutral
- `61-80`: Likely
- `81-100`: Very likely

## Deploy

This is a static project with no build step. Deploy the folder as-is on:

1. GitHub Pages
2. Netlify
3. Vercel
