# Elsbergs Streaming Service

A small static UI for loading a streaming iframe by IMDb ID.

## Overview
- Local HTML/CSS/JS viewer for embedding a streaming player by IMDb id.
- Files in this workspace: [index.html](index.html), [viewer.js](viewer.js), [viewer.css](viewer.css).

## Requirements
- A modern browser (Chrome, Edge, Firefox).
- No server required — the app is static. For some browsers you may need to serve files via a simple local server to avoid local file restrictions.

## Usage
1. Open [index.html](index.html) in your browser.
2. Choose a source using the numbered buttons (1–4).
3. Select content type: `Movies` or `Series`.
4. Enter an IMDb ID in the `IMDb ID` field (example: `tt1375666`).
   - IMDb IDs typically begin with `tt`.
5. If `Series` is selected, fill `Season` and `Episode` fields as needed.
6. Click the `Load` button to inject the player iframe into the player area.
7. Use `Last Episode` and `Next Episode` to navigate between episodes when available.

## Form Notes
- The `IMDb ID` field uses datalist suggestions for movies and series.
- `Season` and `Episode` accept positive integers only.
- A placeholder message displays until a player is loaded.

## Accessibility
- Source buttons use `role="radiogroup"` and `aria-pressed` attributes.
- Mode buttons use `role="tablist"` and `role="tab"` with `aria-selected`.

## Troubleshooting
- Nothing loads: open the browser console (F12) and check for errors from `viewer.js`.
- Incorrect IMDb id: ensure it starts with `tt` and is valid on IMDb.
- iframe blocked: the remote provider may restrict embedding (check console for mixed-content or CSP errors).
- If running from the file system causes issues, serve the folder with a simple HTTP server, for example:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000
```

Then open `http://localhost:8000/index.html`.

## Development
- Edit behavior in [viewer.js](viewer.js) and styles in [viewer.css](viewer.css).
- A small "DEV" banner may appear when running in a development environment.

## License
Copy, adapt, or integrate this README into your project as needed.
