import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export const Route = createFileRoute("/players/")({
  head: () => ({
    meta: [{ title: "Players — SDBD" }, { name: "description", content: "Discover SDBD players and their stats." }],
  }),
  component: PlayersPage,
});

function PlayersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,username,display_name,avatar_url,country,rating,wins,losses,goals_scored,tournaments_won")
      .order("rating", { ascending: false })
      .limit(120)
      .then(({ data }) => setRows(data ?? []));
  }, []);
  const filtered = rows.filter(
    (r) => r.username.toLowerCase().includes(q.toLowerCase()) || (r.display_name || "").toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-6xl">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--ice)]">Roster</div>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-6xl"><span className="text-gradient-gold">Players</span></h1>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players..." className="mt-6 max-w-sm border-white/10 bg-white/5" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <Link to="/players/$username" params={{ username: p.username }} key={p.id}>
              <motion.div whileHover={{ y: -4 }} className="glass group rounded-2xl border border-white/10 p-5 transition hover:border-[var(--ice)]/40 hover:shadow-[var(--shadow-glow-ice)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--gradient-aurora)] font-bold text-[var(--background)]">
                    {(p.display_name || p.username).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display font-bold">{p.display_name || p.username}</div>
                    <div className="truncate text-xs text-muted-foreground">@{p.username} · {p.country || "BD"}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                  <Stat label="Rating" value={p.rating} highlight />
                  <Stat label="W" value={p.wins} />
                  <Stat label="L" value={p.losses} />
                  <Stat label="🏆" value={p.tournaments_won} />
                </div>
              </motion.div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="glass col-span-full rounded-2xl p-10 text-center text-muted-foreground">No players found.</div>}
        </div>
      </Section>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] py-1.5">
      <div className={`font-display font-bold ${highlight ? "text-[var(--gold)]" : ""}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
