import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({ players: 0, tournaments: 0, pendingRegs: 0, pendingSubs: 0 });
  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("tournaments").select("id", { count: "exact", head: true }),
      supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("match_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]).then(([a, b, c, d]) => setStats({ players: a.count ?? 0, tournaments: b.count ?? 0, pendingRegs: c.count ?? 0, pendingSubs: d.count ?? 0 }));
  }, []);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ["Players", stats.players],
        ["Tournaments", stats.tournaments],
        ["Pending Registrations", stats.pendingRegs],
        ["Pending Match Results", stats.pendingSubs],
      ].map(([l, v]) => (
        <div key={l as string} className="glass rounded-2xl p-5">
          <div className="font-display text-3xl font-extrabold text-[var(--gold)]">{v as any}</div>
          <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{l as string}</div>
        </div>
      ))}
    </div>
  );
}
