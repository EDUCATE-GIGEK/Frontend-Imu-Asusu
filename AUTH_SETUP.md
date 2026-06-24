# Auth Setup — EDUCATÉ (Imu-Asusu)

How authentication works in this project, how it was set up, and how to use it.

---

## Overview

The app uses **Supabase Auth** for identity (login, OAuth) alongside a custom **`public.user`** table for profile data. These are two separate things:

| Layer | Table | Purpose |
|---|---|---|
| Auth | `auth.users` (Supabase managed) | Credentials, sessions, OAuth tokens |
| Profile | `public.user` | App-specific user data (name, home_country, etc.) |

They are linked by `public.user.auth_id` (UUID → `auth.users.id`).

---

## Database Schema

### `public.user`
| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT | Auto-increment via `user_id_seq` |
| `name` | TEXT | |
| `email` | TEXT UNIQUE | |
| `home_country` | TEXT | |
| `auth_id` | UUID | FK → `auth.users.id` |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `last_login_at` | TIMESTAMPTZ | |

### `public.manuscripts`
| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT | Auto-increment via `manuscripts_id_seq` |
| `user_id` | BIGINT | FK → `public.user.id` |
| `title` | TEXT | |
| `manuscript_description` | TEXT | |
| `contexts` | JSONB | `{ states, localGovernments, ethnicGroups, tribes }` |
| `created_at` | TIMESTAMPTZ | Default `now()` |

---

## Auto-increment Fix

Both `public.user.id` and `public.manuscripts.id` are BIGINT columns without a built-in `SERIAL`/`IDENTITY`. A sequence was created and wired to each:

```sql
-- user table
CREATE SEQUENCE IF NOT EXISTS user_id_seq;
ALTER TABLE public.user ALTER COLUMN id SET DEFAULT nextval('user_id_seq');
SELECT setval('user_id_seq', COALESCE((SELECT MAX(id) FROM public.user), 0) + 1, false);

-- manuscripts table
CREATE SEQUENCE IF NOT EXISTS manuscripts_id_seq;
ALTER TABLE public.manuscripts ALTER COLUMN id SET DEFAULT nextval('manuscripts_id_seq');
SELECT setval('manuscripts_id_seq', COALESCE((SELECT MAX(id) FROM public.manuscripts), 0) + 1, false);
```

---

## Trigger: Auto-create profile on sign-up

When a new user signs in via Google OAuth (or any Supabase Auth method), a DB trigger fires to create the `public.user` row automatically.

### Trigger function
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user (auth_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;
```

### Trigger
```sql
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

This fires once per new user. It reads from `auth.users` (the row Supabase just inserted) and creates a matching profile in `public.user`.

---

## Google OAuth Setup

### Supabase side
1. Dashboard → **Authentication → Providers → Google** → Enable
2. Paste in your Google Client ID and Client Secret
3. Copy the **Callback URL** shown (e.g. `https://<project>.supabase.co/auth/v1/callback`)

### Google Cloud Console
1. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Authorised redirect URIs: paste the Supabase callback URL from above
4. Copy the Client ID and Secret back into Supabase

### Redirect after login
The app redirects to `/app/country` after OAuth completes. This is set in:

```js
// src/services/auth/signInWithOAuth.js
supabase.auth.signInWithOAuth({
  provider,
  options: { redirectTo: `${window.location.origin}/app/country` },
})
```

---

## Auth service files

All auth operations are in `src/services/auth/`:

| File | What it does |
|---|---|
| `signInWithPassword.js` | Email + password login |
| `signInWithOAuth.js` | Google (or any provider) OAuth login |
| `signUp.js` | Email + password sign-up |
| `signInWithOtp.js` | Magic link / OTP login |
| `signOut.js` | Signs the user out |
| `getSession.js` | Returns current session |
| `getUser.js` | Returns current auth user |
| `getUserProfile.js` | Fetches `public.user` row by `auth_id` |
| `onAuthStateChange.js` | Subscribes to auth state changes |

---

## AuthContext

`src/contexts/AuthContext.jsx` wraps the whole app and exposes:

```js
const { session, user, profile, isLoading } = useAuth();
```

| Value | Type | What it is |
|---|---|---|
| `session` | Supabase Session or null | The raw Supabase auth session |
| `user` | Supabase User or null | Auth user object (`user.id` is the UUID) |
| `profile` | `public.user` row or null | App profile with `profile.id` (BIGINT), `profile.name`, `profile.home_country`, etc. |
| `isLoading` | boolean | True while the initial session check is in progress |

### How to get the logged-in user's data

```js
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, profile } = useAuth();

  // Auth identity (from Supabase Auth)
  console.log(user.id);       // UUID — use this to link to auth.users
  console.log(user.email);    // email from auth

  // App profile (from public.user)
  console.log(profile.id);          // BIGINT — use this as user_id FK in other tables
  console.log(profile.name);
  console.log(profile.home_country);
}
```

Use `profile.id` whenever you need to write `user_id` to a table like `manuscripts`.

---

## Login page

`src/pages/Login.jsx` supports:
- **Email + password** via `signInWithPassword`
- **Google OAuth** via `signInWithOAuth`

On successful email login, navigates to `/app/country`.  
On OAuth, Supabase handles the redirect — the app receives a session at `/app/country`.

---

## Manuscripts auth gate

The Manuscripts page gates the "Add Manuscript" button behind auth:

```js
onClick={() => {
  if (!session) { setShowLoginPrompt(true); return; }
  setIsCreating(true);
}}
```

If not logged in, an inline prompt appears with a "Log in" button linking to `/login`.  
When saving, `profile.id` is used as `user_id` — no hardcoded values.
