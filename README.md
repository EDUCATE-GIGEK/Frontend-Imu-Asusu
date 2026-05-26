# Ịmụ-Asụsụ — Frontend

React + Vite frontend for **Proj 1: Ịmụ-Asụsụ** (EDUCATE-GIGEK/Educate-Org) — an educational web platform for cultural preservation and history education, featuring timeline- and map-based exploration of human history.

## Stack

- React 18 + Vite (JSX)
- react-router-dom
- @tanstack/react-query (+ devtools)
- axios for the custom backend (local PostgreSQL via your own API)
- react-hook-form
- react-hot-toast
- react-icons
- styled-components
- date-fns

## Folder layout

```
src/
├── assets/      # static images, svgs
├── data/        # seed/sample data + dev uploaders
├── features/    # feature-grouped components
├── hooks/       # custom React hooks
├── pages/       # route-level views
├── services/    # API client + per-resource service modules
├── styles/      # global styles
├── ui/          # generic presentational components
└── utils/       # helpers
```

## Run

```sh
cp .env.example .env       # point VITE_API_URL at your local API
npm install
npm run dev
```

Vite proxies `/api/*` to `http://localhost:3000` by default — change in `vite.config.js` to match your backend port.
