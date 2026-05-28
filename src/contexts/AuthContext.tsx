import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "user" | "property_owner" | "printing_vendor" | "agency" | "business";

const PENDING_ROLE_KEY = "xads_pending_role";
const VALID_ROLES: AppRole[] = ["admin", "user", "property_owner", "printing_vendor", "agency", "business"];

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  primaryRole: AppRole | null;
  roleLoading: boolean;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  primaryRole: null,
  roleLoading: true,
  refreshRole: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [primaryRole, setPrimaryRole] = useState<AppRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const fetchRole = async (uid: string) => {
    setRoleLoading(true);
    const { data } = await supabase
      .from("user_role_selections")
      .select("primary_role")
      .eq("user_id", uid)
      .maybeSingle();
    setPrimaryRole((data?.primary_role as AppRole) ?? null);
    setRoleLoading(false);
  };

  const applyPendingRole = async (uid: string) => {
    const pendingRole = window.sessionStorage.getItem(PENDING_ROLE_KEY) as AppRole | null;

    if (!pendingRole || !VALID_ROLES.includes(pendingRole)) return;

    const { error } = await supabase
      .from("user_role_selections")
      .upsert({ user_id: uid, primary_role: pendingRole }, { onConflict: "user_id" });

    if (!error) {
      window.sessionStorage.removeItem(PENDING_ROLE_KEY);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setTimeout(async () => {
          await applyPendingRole(newSession.user.id);
          await fetchRole(newSession.user.id);
        }, 0);
      } else {
        setPrimaryRole(null);
        setRoleLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        applyPendingRole(session.user.id).then(() => fetchRole(session.user.id));
      }
      else setRoleLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshRole = async () => {
    if (user) await fetchRole(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, primaryRole, roleLoading, refreshRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
