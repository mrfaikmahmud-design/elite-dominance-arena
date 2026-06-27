import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard/tournaments")({
  component: MyTournaments,
});

function MyTournaments() {
  const { user } = useAuth();
  const [regs, setRegs] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("registrations")
      .select("*,tournament:tournaments(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRegs(data ?? []));
  }, [user]);
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold">My Tournaments</h2>
      {regs.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          You haven't joined any tournaments. <Link to="/tournaments" className="text-[var(--gold)]">Browse open tournaments →</Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {regs.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div>
                <Link to="/tournaments/$slug" params={{ slug: r.tournament.slug }} className="font-display font-bold hover:text-[var(--gold)]">{r.tournament.name}</Link>
                <div className="text-xs text-muted-foreground">{format(new Date(r.tournament.starts_at), "MMM d, yyyy · p")} · Status: {r.tournament.status}</div>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs uppercase ${r.status === "approved" ? "border-[var(--gold)]/40 text-[var(--gold)]" : "border-white/15 text-muted-foreground"}`}>{r.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
