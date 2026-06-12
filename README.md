# History Viewer

Explore world history at any map location using **Ctrl + scroll** to move through time.

## Features

- Leaflet world map with OpenStreetMap tiles
- Ctrl/Cmd + mousewheel scrubs through time at the map center
- History pane with AI-generated (or mock) context
- Free-tier providers only: Gemini, Groq, optional Ollama, plus mock fallback

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:4200`.

By default `.env.example` sets `USE_MOCK_HISTORY=true`, so the app works with zero API keys.

To use real free-tier AI:

1. Set `USE_MOCK_HISTORY=false`
2. Add a free `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/) and/or `GROQ_API_KEY`
3. Set `NOMINATIM_USER_AGENT` to something like `history-viewer/1.0 (you@example.com)`

## Scripts

- `npm start` — runs Angular app and API together
- `npm run start:app` — Angular dev server only
- `npm run start:api` — API server only
- `npm run build` — production Angular build
