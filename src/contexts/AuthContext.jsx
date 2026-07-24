import { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "@/services/auth/getSession";
import { onAuthStateChange } from "@/services/auth/onAuthStateChange";
import { getUserProfile } from "@/services/auth/getUserProfile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  // Distinguishes "still fetching the profile" from "there is no profile", so
  // callers waiting on profile-backed data (preferences) know when to give up.
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    getSession().then(setSession);

    const subscription = onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) { setProfile(null); setIsProfileLoading(false); return; }
    setIsProfileLoading(true);
    getUserProfile(session.user.id)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setIsProfileLoading(false));
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isProfileLoading,
        isLoading: session === undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
