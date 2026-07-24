// User onboarding preferences (chosen regions + intent).
//
// Two stores, one shape. An anonymous visitor has only localStorage — that is
// their durable copy, and it is what lets onboarding work before there is an
// account to attach it to. Once someone signs in, `public.user.preferences` is
// the source of truth and localStorage becomes a mirror, so reads stay
// synchronous and every consumer of usePreferences keeps its current shape.
//
// This module is the only place that knows about either store. Keep all
// reads/writes going through here.

import supabase from "./supabase";

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

// Be forgiving about shape — a malformed/older blob falls back to empty. Used
// for both stores, since the database holds the same object localStorage does.
function normalize(parsed) {
  if (!parsed || typeof parsed !== "object") return emptyPrefs();
  return {
    version: VERSION,
    regions: Array.isArray(parsed.regions) ? parsed.regions : [],
    intent: INTENTS.includes(parsed.intent) ? parsed.intent : null,
    completedAt: parsed.completedAt ?? null,
  };
}

// ── Local store ─────────────────────────────────────────────────────────────

export function getPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPrefs();
    return normalize(JSON.parse(raw));
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

// ── Remote store ────────────────────────────────────────────────────────────

// `user_preferences` rather than a column on `public.user`, because that table
// is world-readable and a person's regions of interest are nobody else's
// business. Owner-only RLS; nothing here ever reads another user's row.

// Returns null when the user has never saved preferences, which is what tells
// the caller to adopt whatever is in localStorage instead of overwriting it.
export async function fetchRemotePreferences(userId) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("preferences")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.preferences ? normalize(data.preferences) : null;
}

export async function saveRemotePreferences(userId, prefs) {
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, preferences: prefs, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  return prefs;
}

// Note: there is deliberately no synchronous `hasCompletedOnboarding()` helper.
// For a signed-in user that question can only be answered once their stored
// preferences have loaded, so it belongs to usePreferences (`isSyncing` +
// `prefs.regions`), not to a localStorage-only read that would answer "no" for
// someone who onboarded on another device.
