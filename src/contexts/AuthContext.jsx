import { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "@/services/auth/getSession";
import { onAuthStateChange } from "@/services/auth/onAuthStateChange";
import { getUserProfile } from "@/services/auth/getUserProfile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getSession().then(setSession);

    const subscription = onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) { setProfile(null); return; }
    getUserProfile(session.user.id).then(setProfile).catch(() => setProfile(null));
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
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
