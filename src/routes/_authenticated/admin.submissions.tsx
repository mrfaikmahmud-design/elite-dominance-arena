import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  component: AdminSubs,
});

function AdminSubs() {
  const [list, setList] = useState<any[]>([]);
  const refresh = () =>
    supabase
      .from("match_submissions")
      .select("*,fixture:fixtures(*,tournament:tournaments(name),p1:profiles!fixtures_player1_id_fkey(username,id,rating),p2:profiles!fixtures_player2_id_fkey(username,id,rating))")
      .order("created_at", { ascending: false })
      .then(({ data }) => setList(data ?? []));
  useEffect(() => { refresh(); }, []);

  const approve = async (s: any) => {
    const f = s.fixture;
    const winnerId = s.player1_score > s.player2_score ? f.player1_id : s.player2_score > s.player1_score ? f.player2_id : null;
    // update fixture
    await supabase.from("fixtures").update({
      player1_score: s.player1_score,
      player2_score: s.player2_score,
      winner_id: winnerId,
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", f.id);
    // update submission
    await supabase.from("match_submissions").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", s.id);
    // update profile stats
    const loserId = winnerId === f.player1_id ? f.player2_id : f.player1_id;
    if (winnerId) {
      await supabase.rpc; // noop — using direct updates
      const { data: wp } = await supabase.from("profiles").select("rating,wins,goals_scored,goals_conceded").eq("id", winnerId).maybeSingle();
      const { data: lp } = await supabase.from("profiles").select("rating,losses,goals_scored,goals_conceded").eq("id", loserId).maybeSingle();
      if (wp) await supabase.from("profiles").update({ rating: wp.rating + 25, wins: wp.wins + 1, goals_scored: wp.goals_scored + Math.max(s.player1_score, s.player2_score), goals_conceded: wp.goals_conceded + Math.min(s.player1_score, s.player2_score) }).eq("id", winnerId);
      if (lp) await supabase.from("profiles").update({ rating: Math.max(500, lp.rating - 15), losses: lp.losses + 1, goals_scored: lp.goals_scored + Math.min(s.player1_score, s.player2_score), goals_conceded: lp.goals_conceded + Math.max(s.player1_score, s.player2_score) }).eq("id", loserId);
    }
    if (winnerId) {
      await supabase.from("notifications").insert([
        { user_id: winnerId, title: "Match Result Approved 🏆", body: `Victory in ${f.tournament?.name} confirmed!`, type: "success" },
        { user_id: loserId!, title: "Match Result Approved", body: `Result for ${f.tournament?.name} is final.`, type: "info" },
      ]);
    }
    toast.success("Approved");
    refresh();
  };
  const reject = async (id: string) => {
    await supabase.from("match_submissions").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
    toast.success("Rejected");
    refresh();
  };
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold">Match Submissions</h2>
      <ul className="mt-3 space-y-3">
        {list.map((s) => (
          <li key={s.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{s.fixture?.tournament?.name} · Round {s.fixture?.round}</div>
                <div className="text-xs text-muted-foreground">{s.fixture?.p1?.username} vs {s.fixture?.p2?.username}</div>
                <div className="mt-1 font-display text-lg font-bold">{s.player1_score} — {s.player2_score}</div>
                {s.notes && <div className="mt-1 text-xs text-muted-foreground">"{s.notes}"</div>}
                {s.screenshot_url && <a href={s.screenshot_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--ice)]">Screenshot <ExternalLink className="h-3 w-3" /></a>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase ${s.status === "approved" ? "text-[var(--gold)]" : s.status === "rejected" ? "text-destructive" : "text-muted-foreground"}`}>{s.status}</span>
                {s.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => approve(s)} className="bg-[var(--gradient-gold)] text-[var(--gold-foreground)]">Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(s.id)}>Reject</Button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="text-sm text-muted-foreground">No submissions.</li>}
      </ul>
    </div>
  );
}
