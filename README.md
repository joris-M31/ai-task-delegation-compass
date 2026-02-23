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

## Shareable URL state

Slider state is synced to query params:

`?human=60&prob=50&ai=60`

Behavior:

- On load, the app reads `human`, `prob`, and `ai` from the URL (if present and valid).
- As sliders move (or presets/reset are used), the URL updates via `history.replaceState` without reloading.

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
