// The working layer for notes, in localStorage, keyed by (user, context). It holds
// two kinds of item, both surviving reload so no in-progress work is ever lost:
//   - drafts        — notes never saved to the DB (id starts with "draft-").
//   - overlays      — unsaved edits to an already-saved note (id is the DB id as a
//                     string). The overlay's body/position override the DB row until
//                     the user saves, at which point the overlay is removed.
// An explicit Save is what moves a draft into the DB / clears an overlay.

const PREFIX = "imu.notes.drafts";

// A signed-out visitor may keep one note before making an account. It lives in
// this same working layer under a sentinel user, so all the draft persistence
// works unchanged; the only differences are that nothing is written to the DB
// and the cap is one note total (see useNotes). On sign-in these are migrated
// into the account and cleared — see useAnonMigration.
export const ANON_USER = "anon";

function storageKey(userId, contextType, contextId) {
  return `${PREFIX}.${userId}.${contextType}.${contextId}`;
}

// Every anonymous working note, across whatever contexts they were taken in,
// each tagged with its context so migration and the global cap can find them.
// Scans localStorage because a signed-out user's notes aren't behind any query.
export function readAllAnonWorking() {
  const out = [];
  const prefix = `${PREFIX}.${ANON_USER}.`;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    const [contextType, contextId] = key.slice(prefix.length).split(".");
    try {
      const items = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(items)) {
        for (const item of items) out.push({ ...item, contextType, contextId });
      }
    } catch {
      // Skip a corrupt blob rather than fail the whole scan.
    }
  }
  return out;
}

export function countAnonWorking() {
  return readAllAnonWorking().length;
}

export function clearAnonWorking() {
  const prefix = `${PREFIX}.${ANON_USER}.`;
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
}

export function readWorking(userId, contextType, contextId) {
  if (!userId || !contextType || !contextId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId, contextType, contextId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWorking(userId, contextType, contextId, items) {
  if (!userId || !contextType || !contextId) return;
  try {
    localStorage.setItem(
      storageKey(userId, contextType, contextId),
      JSON.stringify(items),
    );
  } catch {
    // Quota or unavailable storage — the in-memory cache still holds this session.
  }
}

// Insert or replace a working item by id (drafts and overlays share this).
export function upsertWorking(userId, contextType, contextId, item) {
  const items = readWorking(userId, contextType, contextId);
  const idx = items.findIndex((w) => String(w.id) === String(item.id));
  if (idx === -1) items.push(item);
  else items[idx] = { ...items[idx], ...item };
  writeWorking(userId, contextType, contextId, items);
}

export function removeWorking(userId, contextType, contextId, id) {
  writeWorking(
    userId,
    contextType,
    contextId,
    readWorking(userId, contextType, contextId).filter((w) => String(w.id) !== String(id)),
  );
}

// Draft ids are prefixed so a working draft (localStorage-only) is distinguishable
// from a saved row (DB, numeric id) — and from an overlay (whose id is a DB id).
export function newDraftId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isDraftId(id) {
  return typeof id === "string" && id.startsWith("draft-");
}
