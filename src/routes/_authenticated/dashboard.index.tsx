import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Target, Zap, Award } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashOverview,
});

function DashOverview() {
  const { user } = useAuth();
  const [p, setP] = useState<any>(null);
  const [regs, setRegs] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("id,username,display_name,avatar_url,rating,wins,losses,draws,goals_scored,goals_conceded,tournaments_played,tournaments_won").eq("id", user.id).maybeSingle().then(({ data }) => setP(data));
    supabase
      .from("registrations")
      .select("*,tournament:tournaments(name,slug,starts_at,status)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRegs(data ?? []));
  }, [user]);
  if (!p) return <div className="glass animate-shimmer h-40 rounded-2xl" />;
  const matches = p.wins + p.losses + p.draws;
  const wr = matches ? Math.round((p.wins / matches) * 100) : 0;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Rating", v: p.rating, icon: Zap, gold: true },
          { l: "Win Rate", v: `${wr}%`, icon: Target },
          { l: "Trophies", v: p.tournaments_won, icon: Trophy },
          { l: "Badges", v: 0, icon: Award },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-5">
            <s.icon className={`mb-3 h-5 w-5 ${s.gold ? "text-[var(--gold)]" : "text-[var(--ice)]"}`} />
            <div className="font-display text-3xl font-extrabold">{s.v}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Recent Registrations</h2>
        {regs.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">You haven't registered for any tournaments yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {regs.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-3 text-sm">
                <div>
                  <div className="font-medium">{r.tournament?.name}</div>
                  <div className="text-xs text-muted-foreground">{r.tournament?.status}</div>
                </div>
                <span className={`text-xs uppercase ${r.status === "approved" ? "text-[var(--gold)]" : "text-muted-foreground"}`}>{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
