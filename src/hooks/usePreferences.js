import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPreferences,
  savePreferences,
  clearPreferences,
  fetchRemotePreferences,
  saveRemotePreferences,
  PREFS_CHANGED_EVENT,
} from "@/services/preferences";

// React wrapper over the preferences service so components re-render when the
// user's regions/intent change. localStorage is not reactive on its own, so we
// mirror it in state and re-read on our same-tab change event (and cross-tab
// `storage` events), keeping every consumer — sidebar, hub, onboarding — in sync.
//
// Signed-in users are backed by `public.user.preferences`; the local copy is
// then only a mirror, which is what keeps these reads synchronous and this
// hook's shape unchanged for the components that consume it.
export default function usePreferences() {
  const { profile, isProfileLoading } = useAuth();
  const [prefs, setPrefs] = useState(getPreferences);
  const [syncedFor, setSyncedFor] = useState(null); // profile id already reconciled

  // True while a signed-in user's stored preferences are still on their way.
  // Anything that branches on `prefs` before this clears — the onboarding
  // redirect above all — would otherwise decide from an empty local mirror.
  const isSyncing = isProfileLoading || (!!profile?.id && syncedFor !== profile.id);

  useEffect(() => {
    const sync = () => setPrefs(getPreferences());
    window.addEventListener(PREFS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREFS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // On sign-in, reconcile the two stores. The account wins when it has anything
  // saved; otherwise this is someone who onboarded before signing up, so their
  // local choices are adopted onto the account rather than dropped.
  useEffect(() => {
    if (!profile?.id) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const remote = await fetchRemotePreferences(profile.id);
        if (cancelled) return;
        if (remote?.regions.length) {
          setPrefs(savePreferences(remote));
        } else {
          const local = getPreferences();
          if (local.regions.length) await saveRemotePreferences(profile.id, local);
        }
      } catch {
        // Offline, or the row is unreadable — the local mirror stays in place so
        // the app keeps working, and the next save re-syncs.
      } finally {
        // Marked done either way: a failed sync must not leave callers waiting
        // forever on a decision they can make from the local mirror.
        if (!cancelled) setSyncedFor(profile.id);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  // Writes go to both stores. The local write is what re-renders consumers, so
  // it happens first and is never blocked on the network.
  const save = useCallback(
    (next) => {
      const saved = savePreferences(next);
      setPrefs(saved);
      if (profile?.id) saveRemotePreferences(profile.id, saved).catch(() => {});
      return saved;
    },
    [profile?.id],
  );

  // Clearing is a deliberate reset of the account's preferences, not a logout —
  // signOut only drops the local mirror, so signing back in restores them.
  const clear = useCallback(() => {
    clearPreferences();
    const empty = getPreferences();
    setPrefs(empty);
    if (profile?.id) saveRemotePreferences(profile.id, empty).catch(() => {});
  }, [profile?.id]);

  return { prefs, save, clear, isSyncing };
}
