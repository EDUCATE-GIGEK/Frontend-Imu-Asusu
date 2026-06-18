# Changes

## Supabase

- Created `cultural_history` table with RLS enabled
- Added public `SELECT` policies to: `continents`, `countries`, `states`, `local_governments`, `ethnic_groups`, `tribes`, `cultural_history`
- Added `title TEXT` column to `manuscripts`
- Added `contexts JSONB` column to `manuscripts`
- Added RLS policies to `manuscripts`: public `SELECT`, authenticated `INSERT` / `UPDATE` / `DELETE`
- Added public `SELECT` policy to `user`

## New files

- `.env` — fixed keys to `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` with real anon key
- `src/services/supabase.js` — fixed missing `createClient` import, `process.env` → `import.meta.env`
- `src/services/apiContinents.js`
- `src/services/apiCountries.js`
- `src/services/apiStates.js`
- `src/services/apiLocalGovernments.js`
- `src/services/apiEthnicGroups.js`
- `src/services/apiTribes.js`
- `src/services/apiHistory.js`
- `src/services/apiManuscripts.js`
- `src/contexts/AuthContext.jsx`
- `src/data/usersData.csv` + `usersData.json`
- `src/data/userSettingsData.csv` + `userSettingsData.json`
- `src/data/userManuscriptsData.csv` + `userManuscriptsData.json`

## Updated files

| File | What changed |
|---|---|
| `src/main.jsx` | Added `QueryClientProvider` |
| `src/App.jsx` | Added `AuthProvider`, removed `LiveContext` comment clutter |
| `src/pages/NigeriaStatesLayout.jsx` | Fetches states from Supabase via `useQuery` |
| `src/pages/CountryPage.jsx` | Fetches country + states from Supabase |
| `src/pages/StatePage.jsx` | Fetches state, LGs, ethnic groups from Supabase |
| `src/pages/LocalGovernmentPage.jsx` | Fetches LG + ethnic groups from Supabase |
| `src/pages/EthnicGroupPage.jsx` | Fetches ethnic group, tribes, history from Supabase |
| `src/pages/TribePage.jsx` | Fetches tribe from Supabase |
| `src/pages/Manuscripts.jsx` | Full rewrite — Supabase create/edit/load, auth guard, login prompt on save, restored checkboxes (States/LGs/Ethnic Groups/Tribes) loaded from Supabase, `contexts` JSONB saved |
| `src/features/AppLayout/Dashboard.jsx` | New UI — chevron toggle icons, active route detection for all nav items, `bg-orange-300/50` active state, no white backgrounds |
| `package.json` | Added `@supabase/supabase-js` |
