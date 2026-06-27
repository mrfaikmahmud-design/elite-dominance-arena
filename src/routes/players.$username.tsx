import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/PageTransition";
import { Trophy, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/players/$username")({
  component: PlayerProfile,
});

function PlayerProfile() {
  const { username } = Route.useParams();
  const [p, setP] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("id,username,display_name,avatar_url,country,favorite_club,bio,rating,wins,losses,draws,goals_scored,goals_conceded,tournaments_played,tournaments_won").eq("username", username).maybeSingle().then(({ data }) => {
      setP(data);
      if (data) {
        supabase.from("player_badges").select("*").eq("user_id", data.id).then(({ data: b }) => setBadges(b ?? []));
        supabase
          .from("fixtures")
          .select("*,tournament:tournaments(name),p1:profiles!fixtures_player1_id_fkey(username),p2:profiles!fixtures_player2_id_fkey(username)")
          .or(`player1_id.eq.${data.id},player2_id.eq.${data.id}`)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(8)
          .then(({ data: r }) => setRecent(r ?? []));
      }
    });
  }, [username]);

  if (!p) return <div className="py-24 text-center text-muted-foreground">Loading...</div>;
  const matches = p.wins + p.losses + p.draws;
  const winRate = matches > 0 ? Math.round((p.wins / matches) * 100) : 0;

  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-5xl">
        <Link to="/players" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All players
        </Link>
        <div className="glass-strong mt-6 rounded-3xl border border-white/10 p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="grid h-28 w-28 place-items-center rounded-2xl bg-[var(--gradient-aurora)] font-display text-3xl font-extrabold text-[var(--background)] shadow-[var(--shadow-glow-gold)]">
              {(p.display_name || p.username).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display text-3xl font-extrabold md:text-5xl">{p.display_name || p.username}</h1>
              <div className="mt-1 text-sm text-muted-foreground">@{p.username} · {p.country || "BD"}{p.efootball_username ? ` · eFootball: ${p.efootball_username}` : ""}</div>
              {p.favorite_club && <div className="mt-1 text-sm text-[var(--ice)]">Favorite club: {p.favorite_club}</div>}
              {p.bio && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{p.bio}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 text-center">
                <div className="font-display text-3xl font-extrabold text-[var(--gold)]">{p.rating}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[
              ["Wins", p.wins],
              ["Losses", p.losses],
              ["Draws", p.draws],
              ["Goals", p.goals_scored],
              ["Win %", `${winRate}%`],
              ["Trophies", p.tournaments_won],
            ].map(([l, v]) => (
              <div key={l as string} className="glass rounded-xl p-3 text-center">
                <div className="font-display text-xl font-bold">{v as any}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">Achievements</h2>
            {badges.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No badges yet — keep grinding.</p>
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {badges.map((b) => (
                  <li key={b.id} className="glass rounded-lg p-3">
                    <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-[var(--gold)]" /> <span className="text-sm font-semibold">{b.badge_name}</span></div>
                    {b.description && <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">Recent Matches</h2>
            {recent.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No completed matches yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {recent.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-2">
                    <span className="truncate">{m.tournament?.name}</span>
                    <span className="font-display font-bold">{m.player1_score}–{m.player2_score}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
