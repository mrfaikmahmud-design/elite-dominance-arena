import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — SDBD" },
      { name: "description", content: "Top SDBD eFootball players ranked by performance and rating." },
    ],
  }),
  component: LeaderboardPage,
});

type Row = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  rating: number;
  wins: number;
  losses: number;
  goals_scored: number;
  tournaments_won: number;
  country: string | null;
};

function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [tab] = useState<"all">("all");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,username,display_name,avatar_url,rating,wins,losses,goals_scored,tournaments_won,country")
      .order("rating", { ascending: false })
      .limit(100)
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, [tab]);

  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-5xl">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--ice)]">Top 100 · Ranked</div>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-6xl">
          <span className="text-gradient-gold">Leaderboard</span>
        </h1>
        <p className="mt-3 text-muted-foreground">The dominators. Ranked by SDBD performance rating.</p>

        {/* Podium */}
        {rows.length >= 3 && (
          <div className="mt-12 grid grid-cols-3 items-end gap-3">
            {[rows[1], rows[0], rows[2]].map((p, i) => {
              const place = i === 1 ? 1 : i === 0 ? 2 : 3;
              const heights = ["h-32", "h-44", "h-24"];
              const colors = [
                "from-[oklch(0.85_0.05_240)] to-[oklch(0.7_0.07_240)]",
                "from-[oklch(0.92_0.15_95)] to-[oklch(0.82_0.18_75)]",
                "from-[oklch(0.7_0.08_60)] to-[oklch(0.55_0.1_50)]",
              ];
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-2 flex flex-col items-center">
                    {place === 1 && <Crown className="mb-1 h-6 w-6 text-[var(--gold)]" />}
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--gradient-aurora)] text-lg font-bold text-[var(--background)] shadow-[var(--shadow-glow-gold)]">
                      {(p.display_name || p.username).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="mt-2 text-sm font-semibold">{p.display_name || p.username}</div>
                    <div className="text-xs text-[var(--gold)]">{p.rating} pts</div>
                  </div>
                  <div className={`${heights[i]} w-full rounded-t-xl bg-gradient-to-b ${colors[i]} opacity-90 shadow-[var(--shadow-glow-gold)]`}>
                    <div className="grid h-full place-items-center font-display text-3xl font-extrabold text-[var(--background)]">#{place}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="glass-strong mt-12 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2 text-right">Rating</div>
            <div className="col-span-1 text-right">W</div>
            <div className="col-span-1 text-right">L</div>
            <div className="col-span-2 text-right">Goals</div>
            <div className="col-span-1 text-right">🏆</div>
          </div>
          {rows.map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(idx * 0.02, 0.6) }}
              className="grid grid-cols-12 items-center gap-2 border-b border-white/5 px-4 py-3 text-sm transition hover:bg-white/[0.03] last:border-0"
            >
              <div className="col-span-1 font-display font-bold text-[var(--gold)]">{idx + 1}</div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-bold">
                  {(r.display_name || r.username).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{r.display_name || r.username}</div>
                  <div className="truncate text-xs text-muted-foreground">@{r.username} · {r.country || "BD"}</div>
                </div>
              </div>
              <div className="col-span-2 text-right font-display font-bold">{r.rating}</div>
              <div className="col-span-1 text-right text-[var(--gold)]">{r.wins}</div>
              <div className="col-span-1 text-right text-muted-foreground">{r.losses}</div>
              <div className="col-span-2 text-right">{r.goals_scored}</div>
              <div className="col-span-1 text-right">{r.tournaments_won}</div>
            </motion.div>
          ))}
          {rows.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">No ranked players yet — be the first.</div>
          )}
        </div>
      </Section>
    </div>
  );
}
