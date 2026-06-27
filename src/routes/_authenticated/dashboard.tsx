import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Section } from "@/components/PageTransition";
import { LayoutDashboard, User, Trophy, Bell, Upload, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashLayout,
});

const tabs: Array<{ to: any; label: string; icon: any; exact?: boolean }> = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/tournaments", label: "My Tournaments", icon: Trophy },
  { to: "/dashboard/submit-match", label: "Submit Match", icon: Upload },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

function DashLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { isStaff } = useAuth();
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-6xl">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--ice)]">Player Dashboard</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold md:text-5xl"><span className="text-gradient-gold">Your Command Center</span></h1>
        <div className="glass mt-6 flex flex-wrap gap-1 rounded-2xl p-1.5">
          {tabs.map((t) => {
            const active = t.exact ? path === t.to : path.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "bg-[var(--gold)]/15 text-[var(--gold)]" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            );
          })}
          {isStaff && (
            <Link to="/admin" className="ml-auto flex items-center gap-2 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2 text-sm font-semibold text-[var(--gold)]">
              <Shield className="h-4 w-4" /> Admin Panel
            </Link>
          )}
        </div>
        <div className="mt-6"><Outlet /></div>
      </Section>
    </div>
  );
}
