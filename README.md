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

## IMDb API Server

A Flask-based API server ([imdbserver.py](imdbserver.py)) provides metadata lookup using IMDb's suggestion API.

### Installation
Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Server

**Development mode** (auto-reload, debug enabled):
```bash
# Windows
set FLASK_ENV=development
python imdbserver.py

# Linux/macOS
FLASK_ENV=development python imdbserver.py
```

**Production mode** (uses Waitress WSGI server):
```bash
# Windows
python imdbserver.py

# Linux/macOS
python imdbserver.py
```

**Custom port**:
```bash
# Windows
set PORT=8080
python imdbserver.py

# Linux/macOS
PORT=8080 python imdbserver.py
```

### API Endpoints

All endpoints return JSON and support CORS.

- **GET** `/api/health` — Health check
  - Returns: `{"ok": true}`

- **GET** `/api/get_first_imdb_title?name=TITLE` — Get first matching IMDb ID
  - Returns: `{"imdb": "tt1375666"}` or `{"imdb": null}`

- **GET** `/api/get_imdb_title_info?name=TITLE` — Get detailed title info
  - Returns: `{"id": "tt1375666", "title": "Inception", "year": 2010, "type": "movie", "url": "..."}`
  - Returns 404 if not found

- **GET** `/api/get_imdb_look_up?name=TITLE` — Get all matching IMDb IDs
  - Returns: `{"results": ["tt1375666", "tt2345678", ...]}`

- **GET** `/api/get_title_image?title_id=IMDB_ID` — Get poster URL for a title
  - Also accepts `id` or `imdb` query parameter
  - Returns: `{"image": "https://..."}`
  - Returns 404 if not found

### Example Usage
```bash
# Search for a title
curl "http://localhost:5001/api/get_imdb_title_info?name=Matrix"

# Get poster image
curl "http://localhost:5001/api/get_title_image?title_id=tt0133093"
```

### Deployment (Linux Server)

1. Transfer files to server:
   ```bash
   scp -r vidsrc/ user@server:/path/to/app/
   ```

2. Install dependencies:
   ```bash
   cd /path/to/app
   pip install -r requirements.txt
   ```

3. Run as a service (systemd example):
   ```ini
   # /etc/systemd/system/imdbserver.service
   [Unit]
   Description=IMDb Metadata API
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/app
   Environment="FLASK_ENV=production"
   Environment="PORT=5001"
   ExecStart=/usr/bin/python3 /path/to/app/imdbserver.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. Enable and start:
   ```bash
   sudo systemctl enable imdbserver
   sudo systemctl start imdbserver
   sudo systemctl status imdbserver
   ```

5. (Optional) Setup nginx reverse proxy for HTTPS.

## License
Copy, adapt, or integrate this README into your project as needed.
