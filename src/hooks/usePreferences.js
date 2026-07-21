import { useCallback, useEffect, useState } from "react";
import {
  getPreferences,
  savePreferences,
  clearPreferences,
  PREFS_CHANGED_EVENT,
} from "@/services/preferences";

// React wrapper over the preferences service so components re-render when the
// user's regions/intent change. localStorage is not reactive on its own, so we
// mirror it in state and re-read on our same-tab change event (and cross-tab
// `storage` events), keeping every consumer — sidebar, hub, onboarding — in sync.
export default function usePreferences() {
  const [prefs, setPrefs] = useState(getPreferences);

  useEffect(() => {
    const sync = () => setPrefs(getPreferences());
    window.addEventListener(PREFS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREFS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((next) => {
    setPrefs(savePreferences(next));
  }, []);

  const clear = useCallback(() => {
    clearPreferences();
    setPrefs(getPreferences());
  }, []);

  return { prefs, save, clear };
}
