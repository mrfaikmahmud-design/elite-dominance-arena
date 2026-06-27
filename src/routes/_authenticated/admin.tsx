import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/PageTransition";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Newspaper,
  Megaphone,
  Crown,
  Handshake,
  CheckSquare,
  Bell,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const isStaff = (roles ?? []).some((r) => ["super_admin", "admin", "moderator"].includes(r.role));
    if (!isStaff) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

const tabs: Array<{ to: any; label: string; icon: any; exact?: boolean }> = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/admin/registrations", label: "Registrations", icon: CheckSquare },
  { to: "/admin/submissions", label: "Match Results", icon: CheckSquare },
  { to: "/admin/players", label: "Players & Roles", icon: Users },
  { to: "/admin/news", label: "News", icon: Newspaper },
  { to: "/admin/banners", label: "Hero Banners", icon: Megaphone },
  { to: "/admin/hof", label: "Hall of Fame", icon: Crown },
  { to: "/admin/sponsors", label: "Sponsors", icon: Handshake },
  { to: "/admin/notifications", label: "Broadcast", icon: Bell },
];

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
          <Shield className="h-3 w-3" /> SDBD Admin
        </div>
        <h1 className="mt-2 font-display text-3xl font-extrabold md:text-5xl"><span className="text-gradient-gold">Control Room</span></h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="glass h-fit rounded-2xl p-2">
            {tabs.map((t) => {
              const active = t.exact ? path === t.to : path.startsWith(t.to);
              return (
                <Link key={t.to} to={t.to} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "bg-[var(--gold)]/15 text-[var(--gold)]" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
                  <t.icon className="h-4 w-4" /> {t.label}
                </Link>
              );
            })}
          </aside>
          <div><Outlet /></div>
        </div>
      </Section>
    </div>
  );
}
