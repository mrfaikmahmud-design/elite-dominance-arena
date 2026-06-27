import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, LogOut, Shield, Moon, User as UserIcon, Trophy, Calendar, Home, Newspaper, Users, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SdbdLogo } from "./SdbdLogo";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/fixtures", label: "Fixtures", icon: Calendar },
  { to: "/leaderboard", label: "Rankings", icon: Trophy },
  { to: "/players", label: "Players", icon: Users },
  { to: "/hall-of-fame", label: "Hall of Fame", icon: Trophy },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/about", label: "About", icon: UserIcon },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, profile, isStaff } = useAuth();

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto mt-3 max-w-7xl px-3">
        <div className="glass-strong flex items-center justify-between gap-3 rounded-full border border-cyan/30 px-5 py-2.5 neon-cyan">
          <SdbdLogo />

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                    active ? "text-[var(--cyan)]" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-[var(--cyan)]/10 ring-1 ring-[var(--cyan)]/40"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              aria-label="Theme"
              className="grid h-9 w-9 place-items-center rounded-full border border-cyan/30 bg-[var(--surface)]/60 text-[var(--cyan)]"
            >
              <Moon className="h-4 w-4" />
            </button>
            {user ? (
              <Link to="/dashboard" className="relative">
                <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-[var(--cyan)] bg-[var(--surface-2)] text-xs font-bold text-[var(--cyan)]">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="me" className="h-full w-full object-cover" />
                  ) : (
                    (profile?.display_name || user.email || "U").slice(0, 1).toUpperCase()
                  )}
                </span>
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="hidden rounded-full border border-cyan/30 bg-[var(--cyan)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--cyan)] md:inline-block"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-cyan/30 bg-[var(--surface)]/60 text-[var(--cyan)]"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-strong mt-2 grid grid-cols-2 gap-2 rounded-3xl border border-cyan/25 p-3"
            >
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-cyan/15 bg-[var(--surface)]/60 px-3 py-2.5 text-sm font-semibold text-foreground/85 hover:border-cyan/40 hover:text-[var(--cyan)]"
                  >
                    <Icon className="h-4 w-4 text-[var(--cyan)]" /> {l.label}
                  </Link>
                );
              })}
              {user ? (
                <>
                  <Link
                    to="/dashboard/notifications"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-cyan/15 bg-[var(--surface)]/60 px-3 py-2.5 text-sm font-semibold"
                  >
                    <Bell className="h-4 w-4 text-[var(--cyan)]" /> Notifications
                  </Link>
                  {isStaff && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2.5 text-sm font-semibold text-[var(--gold)]"
                    >
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/";
                    }}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-cyan/30 bg-[var(--cyan)]/10 px-3 py-2.5 text-center text-sm font-bold text-[var(--cyan)]"
                  >
                    Player Log-In
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-[var(--gradient-gold)] px-3 py-2.5 text-center text-sm font-bold text-[var(--gold-foreground)]"
                  >
                    Player Sign-Up
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
