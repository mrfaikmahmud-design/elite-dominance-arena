import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "super_admin" | "admin" | "moderator" | "player";

export interface AuthState {
  session: Session | null;
  user: User | null;
  roles: Role[];
  profile: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
  loading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [profile, setProfile] = useState<AuthState["profile"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setRoles([]);
      setProfile(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setRoles((data ?? []).map((r) => r.role as Role));
      });
    supabase
      .from("profiles")
      .select("display_name,username,avatar_url")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setProfile((data as AuthState["profile"]) ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return {
    session,
    user: session?.user ?? null,
    roles,
    profile,
    loading,
    isStaff: roles.some((r) => r === "super_admin" || r === "admin" || r === "moderator"),
    isAdmin: roles.includes("super_admin") || roles.includes("admin"),
    isSuperAdmin: roles.includes("super_admin"),
  };
}
