import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import usePreferences from "@/hooks/usePreferences";

// The site root: first-time visitors go through onboarding; returning visitors
// (who have picked at least one region) land straight on the home hub.
//
// For a signed-in user the answer lives on their account, not in this browser —
// deciding before it arrives would send someone who onboarded on another device
// (or simply logged out here) back through onboarding they have already done.
export default function RootRedirect() {
  const { isLoading } = useAuth();
  const { prefs, isSyncing } = usePreferences();

  if (isLoading || isSyncing) return null;

  return <Navigate to={prefs.regions.length ? "/app" : "/welcome"} replace />;
}
