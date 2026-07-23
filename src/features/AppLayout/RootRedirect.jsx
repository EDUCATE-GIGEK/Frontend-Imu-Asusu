import { Navigate } from "react-router-dom";
import { hasCompletedOnboarding } from "@/services/preferences";

// The site root: first-time visitors go through onboarding; returning visitors
// (who have picked at least one region) land straight on the home hub.
export default function RootRedirect() {
  return <Navigate to={hasCompletedOnboarding() ? "/app" : "/welcome"} replace />;
}
