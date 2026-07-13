# Ịmụ-Asụsụ — Frontend

React + Vite frontend for **Proj 1: Ịmụ-Asụsụ** (EDUCATE-GIGEK/Educate-Org) — an educational web platform for cultural preservation and history education, featuring timeline- and map-based exploration of human history.

## Stack

- React 18 + Vite (JSX)
- Supabase — Postgres, Auth, Storage, and Edge Functions (backend)
- Groq — LLM calls from Edge Functions (e.g. manuscript writing assist)
- @tanstack/react-query (+ devtools)
- react-router-dom
- react-hook-form
- Tailwind CSS v4 + tailwind-styled-components / styled-components
- TipTap (built on ProseMirror) — rich text editor for manuscripts; ProseMirror decorations/plugins power inline AI suggestions
- DOMPurify — sanitizes stored HTML before render
- react-hot-toast
- react-icons
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
