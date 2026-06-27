import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Sparkles, SlidersHorizontal, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const Route = createFileRoute("/fixtures")({
  head: () => ({
    meta: [
      { title: "Match Schedule — SDBD" },
      { name: "description", content: "Live fixtures, results and upcoming matches in the SDBD eFootball solo hub." },
    ],
  }),
  component: FixturesPage,
});

function FixturesPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"today" | "upcoming" | "completed">("today");

  useEffect(() => {
    supabase
      .from("fixtures")
      .select(
        "*,tournament:tournaments(name,slug),p1:profiles!fixtures_player1_id_fkey(username,display_name,avatar_url),p2:profiles!fixtures_player2_id_fkey(username,display_name,avatar_url)",
      )
      .order("scheduled_at", { ascending: true })
      .limit(200)
      .then(({ data }) => setFixtures(data ?? []));
  }, []);

  const filtered = useMemo(() => {
    const today = new Date().toDateString();
    return fixtures.filter((f) => {
      if (q && !(`${f.p1?.display_name ?? ""} ${f.p2?.display_name ?? ""}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (tab === "completed") return f.status === "completed";
      if (tab === "today")
        return f.scheduled_at && new Date(f.scheduled_at).toDateString() === today && f.status !== "completed";
      return f.status === "scheduled" || f.status === "pending_approval";
    });
  }, [fixtures, q, tab]);

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="mx-auto max-w-md md:max-w-2xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan/40 bg-[var(--surface)]/60 text-[var(--cyan)]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-[var(--cyan)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--cyan)]">
            <Calendar className="h-3.5 w-3.5" /> Fixture
          </div>
          <span className="h-10 w-10" />
        </div>

        <h1
          className="mt-5 text-center font-display text-3xl font-black text-gradient-cyan md:text-4xl"
          style={{ textShadow: "0 0 24px rgba(34,211,238,0.5)" }}
        >
          Match Schedule
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Live fixtures, results and upcoming matches
        </p>

        {/* Personal dashboard card */}
        <Link
          to="/dashboard/submit-match"
          className="mt-6 flex items-center gap-4 rounded-3xl border border-cyan/40 bg-gradient-to-r from-[var(--cyan)]/10 to-[#a855f7]/10 p-4 transition hover:border-cyan/70"
          style={{ boxShadow: "0 0 30px -10px rgba(34, 211, 238, 0.5)" }}
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--gradient-cyan)] text-[var(--background)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--cyan)]">Personal Dashboard</div>
            <div className="font-display text-lg font-extrabold text-white">My Match</div>
          </div>
          <ArrowRight className="h-5 w-5 text-[var(--cyan)]" />
        </Link>

        {/* Search */}
        <div className="mt-5 flex gap-2">
          <div className="input-neon flex h-12 flex-1 items-center gap-2 px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by Player Name or SDBD ID..."
              className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--gradient-cyan)] text-[var(--background)] shadow-[var(--shadow-glow-cyan)]">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          {(["today", "upcoming", "completed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                tab === t
                  ? "border-[var(--cyan)] bg-[var(--cyan)]/15 text-[var(--cyan)]"
                  : "border-cyan/15 bg-[var(--surface)]/60 text-muted-foreground"
              }`}
            >
              {t === "today" ? "Today's Matches" : t}
            </button>
          ))}
        </div>

        {/* Match list */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground">No {tab} matches.</div>
          )}
          {filtered.map((f) => (
            <div key={f.id} className="rounded-3xl border border-cyan/20 bg-[var(--surface)]/60 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">
                  {f.scheduled_at ? format(new Date(f.scheduled_at), "EEE, MMM d") : "TBD"}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    f.status === "live"
                      ? "border-red-400/50 bg-red-500/15 text-red-300"
                      : f.status === "completed"
                        ? "border-green-400/40 bg-green-500/15 text-green-300"
                        : "border-cyan/40 bg-[var(--cyan)]/10 text-[var(--cyan)]"
                  }`}
                >
                  {f.status === "scheduled" ? "Scheduled" : f.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <PlayerCell name={f.p1?.display_name || f.p1?.username || "TBD"} avatar={f.p1?.avatar_url} winner={f.winner_id === f.player1_id} />
                <div className="text-center">
                  {f.status === "completed" ? (
                    <div className="font-display text-2xl font-extrabold text-white">
                      {f.player1_score ?? 0} <span className="text-[var(--cyan)]">:</span> {f.player2_score ?? 0}
                    </div>
                  ) : (
                    <div className="font-display text-xl font-black text-[var(--cyan)]" style={{ textShadow: "0 0 12px rgba(34,211,238,0.5)" }}>
                      VS
                    </div>
                  )}
                </div>
                <PlayerCell name={f.p2?.display_name || f.p2?.username || "TBD"} avatar={f.p2?.avatar_url} winner={f.winner_id === f.player2_id} right />
              </div>
              <div className="mt-3 truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                {f.tournament?.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerCell({ name, avatar, winner, right }: { name: string; avatar?: string | null; winner?: boolean; right?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${right ? "flex-row-reverse text-right" : ""}`}>
      <span
        className={`grid h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 ${
          winner ? "border-[var(--gold)]" : "border-cyan/40"
        }`}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center bg-[var(--surface-2)] text-xs font-bold text-[var(--cyan)]">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
      <div className="min-w-0">
        <div className={`truncate text-sm font-bold ${winner ? "text-[var(--gold)]" : "text-white"}`}>{name}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">SDBD</div>
      </div>
    </div>
  );
}
