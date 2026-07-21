// User onboarding preferences (chosen regions + intent).
//
// Persisted in localStorage for now so the flow works for anonymous visitors and
// needs no schema change. This module is the single seam where a future Supabase
// sync would hook in — keep all reads/writes going through here.

const STORAGE_KEY = "imu.prefs";
const VERSION = 1;

// Fired after any write so multiple usePreferences() consumers in the same tab
// (e.g. the sidebar and the hub) stay in sync — the native `storage` event only
// fires in *other* tabs, not the one that wrote.
export const PREFS_CHANGED_EVENT = "imu:prefs-changed";

export const INTENTS = ["teach", "research", "explore"];

// A saved region is a lightweight { kind, id, name } — we store the name so the
// hub and sidebar can render entry points without re-fetching (and still work
// when the public RPCs return nothing). `kind` distinguishes the two trees.
function emptyPrefs() {
  return { version: VERSION, regions: [], intent: null, completedAt: null };
}

export function getPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPrefs();
    const parsed = JSON.parse(raw);
    // Be forgiving about shape — a malformed/older blob falls back to empty.
    return {
      version: VERSION,
      regions: Array.isArray(parsed.regions) ? parsed.regions : [],
      intent: INTENTS.includes(parsed.intent) ? parsed.intent : null,
      completedAt: parsed.completedAt ?? null,
    };
  } catch {
    return emptyPrefs();
  }
}

export function savePreferences(prefs) {
  const next = {
    version: VERSION,
    regions: prefs.regions ?? [],
    intent: prefs.intent ?? null,
    completedAt: prefs.completedAt ?? new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PREFS_CHANGED_EVENT));
  return next;
}

export function clearPreferences() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(PREFS_CHANGED_EVENT));
}

// Onboarding is "done" once the user has picked at least one region.
export function hasCompletedOnboarding() {
  const { regions } = getPreferences();
  return regions.length > 0;
}
