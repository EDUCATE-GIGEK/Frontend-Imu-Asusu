// The one manuscript a signed-out visitor may write before making an account.
//
// The manuscripts table is owner-gated, so anonymous work can't touch the DB —
// it lives here in localStorage instead, autosaved like any other manuscript
// but to this store. On sign-in it is created in the user's account and cleared
// (see useAnonMigration). A visitor gets one; the second is what asks them to
// sign in.

const KEY = "imu.anon.manuscript";
export const ANON_MANUSCRIPT_CHANGED = "imu:anon-manuscript-changed";

// The persisted shape mirrors the autosave snapshot (title, description, …)
// plus a created_at, so the library card and the migration can read it directly.
export function getAnonManuscript() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? null;
  } catch {
    return null;
  }
}

export function setAnonManuscript(snapshot) {
  const existing = getAnonManuscript();
  const next = { ...snapshot, created_at: existing?.created_at ?? new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(ANON_MANUSCRIPT_CHANGED));
  return next;
}

export function clearAnonManuscript() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(ANON_MANUSCRIPT_CHANGED));
}

// Shape a stored snapshot like a manuscripts row so the library list and the
// editor's draft mapper can treat it exactly like a saved manuscript. The id is
// a sentinel — the autosave path branches on the absence of a profile, not on
// this — and there is never a file, since uploads need auth.
export function anonManuscriptRow(snapshot) {
  if (!snapshot) return null;
  return {
    id: "anon",
    __anon: true,
    title: snapshot.title ?? "",
    summary: snapshot.summary ?? "",
    manuscript_description: snapshot.description ?? "",
    contexts: { places: snapshot.places ?? [], peoples: snapshot.peoples ?? [] },
    education_level: snapshot.educationLevel || null,
    is_public: false,
    file_path: null,
    file_name: null,
    created_at: snapshot.created_at ?? new Date().toISOString(),
  };
}
