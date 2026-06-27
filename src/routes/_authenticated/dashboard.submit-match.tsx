import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lock, Send, Trophy, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/submit-match")({
  component: SubmitMatch,
});

function SubmitMatch() {
  const { user } = useAuth();
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [fixtureId, setFixtureId] = useState("");
  const [pending, setPending] = useState(false);
  const [scores, setScores] = useState({ l1p1: "", l1p2: "", l2p1: "", l2p2: "", dp1: "", dp2: "" });
  const [screenshotUrl, setScreenshotUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("fixtures")
      .select("*,tournament:tournaments(name),p1:profiles!fixtures_player1_id_fkey(display_name,username,avatar_url),p2:profiles!fixtures_player2_id_fkey(display_name,username,avatar_url)")
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .in("status", ["scheduled", "live", "pending_approval"])
      .order("scheduled_at", { ascending: true })
      .then(({ data }) => setFixtures(data ?? []));
  }, [user]);

  const selected = fixtures.find((f) => f.id === fixtureId);
  const isP1 = selected && selected.player1_id === user?.id;
  const me = selected ? (isP1 ? selected.p1 : selected.p2) : null;
  const opp = selected ? (isP1 ? selected.p2 : selected.p1) : null;

  const { aggMe, aggOpp, deciderNeeded } = useMemo(() => {
    const a1 = Number(scores.l1p1 || 0) + Number(scores.l2p1 || 0);
    const a2 = Number(scores.l1p2 || 0) + Number(scores.l2p2 || 0);
    const filled = scores.l1p1 !== "" && scores.l1p2 !== "" && scores.l2p1 !== "" && scores.l2p2 !== "";
    return { aggMe: a1, aggOpp: a2, deciderNeeded: filled && a1 === a2 };
  }, [scores]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fixtureId) return toast.error("Pick a fixture");
    if (!screenshotUrl) return toast.error("Screenshot URL is required");
    if (scores.l1p1 === "" || scores.l1p2 === "" || scores.l2p1 === "" || scores.l2p2 === "")
      return toast.error("Fill both league scores");
    if (deciderNeeded && (scores.dp1 === "" || scores.dp2 === ""))
      return toast.error("Decider match required (aggregate tied)");

    const total1 = aggMe + Number(scores.dp1 || 0);
    const total2 = aggOpp + Number(scores.dp2 || 0);
    setPending(true);
    const { error } = await supabase.from("match_submissions").insert({
      fixture_id: fixtureId,
      submitted_by: user!.id,
      // store from p1 perspective regardless of who submits
      player1_score: isP1 ? total1 : total2,
      player2_score: isP1 ? total2 : total1,
      leg1_p1: isP1 ? Number(scores.l1p1) : Number(scores.l1p2),
      leg1_p2: isP1 ? Number(scores.l1p2) : Number(scores.l1p1),
      leg2_p1: isP1 ? Number(scores.l2p1) : Number(scores.l2p2),
      leg2_p2: isP1 ? Number(scores.l2p2) : Number(scores.l2p1),
      decider_p1: deciderNeeded ? (isP1 ? Number(scores.dp1) : Number(scores.dp2)) : null,
      decider_p2: deciderNeeded ? (isP1 ? Number(scores.dp2) : Number(scores.dp1)) : null,
      screenshot_url: screenshotUrl,
    });
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("Result submitted — awaiting admin approval");
    setScores({ l1p1: "", l1p2: "", l2p1: "", l2p2: "", dp1: "", dp2: "" });
    setScreenshotUrl("");
  };

  return (
    <div className="neon-cyan relative overflow-hidden rounded-3xl bg-[var(--surface)]/70 p-5">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-[var(--cyan)]" />
        <h2 className="font-display text-lg font-extrabold text-gradient-cyan">Submit Match Result</h2>
      </div>

      {fixtures.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">You have no pending fixtures right now.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">Fixture</label>
            <select
              value={fixtureId}
              onChange={(e) => setFixtureId(e.target.value)}
              className="input-neon mt-1 h-11 w-full px-3 text-sm"
            >
              <option value="">Select your fixture...</option>
              {fixtures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.tournament?.name} · R{f.round} · M{f.match_number}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="flex items-center justify-around rounded-2xl border border-cyan/20 bg-[var(--surface-2)]/40 p-3">
              <PlayerMini p={me} />
              <span className="font-display text-xl font-black text-[var(--cyan)]" style={{ textShadow: "0 0 12px rgba(34,211,238,0.5)" }}>VS</span>
              <PlayerMini p={opp} right />
            </div>
          )}

          {/* 1st League */}
          <LegRow
            label="1st League"
            p1={scores.l1p1}
            p2={scores.l1p2}
            onP1={(v) => setScores((s) => ({ ...s, l1p1: v }))}
            onP2={(v) => setScores((s) => ({ ...s, l1p2: v }))}
          />
          {/* 2nd League */}
          <LegRow
            label="2nd League"
            p1={scores.l2p1}
            p2={scores.l2p2}
            onP1={(v) => setScores((s) => ({ ...s, l2p1: v }))}
            onP2={(v) => setScores((s) => ({ ...s, l2p2: v }))}
          />

          {(scores.l1p1 !== "" && scores.l2p1 !== "") && (
            <div
              className={`rounded-2xl border px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] ${
                deciderNeeded ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold)]" : "border-cyan/30 bg-[var(--cyan)]/10 text-[var(--cyan)]"
              }`}
            >
              Aggregate {aggMe} — {aggOpp}
              {deciderNeeded && <span> · Decider Required</span>}
            </div>
          )}

          {/* Decider Match */}
          <LegRow
            label="Decider Match"
            p1={scores.dp1}
            p2={scores.dp2}
            onP1={(v) => setScores((s) => ({ ...s, dp1: v }))}
            onP2={(v) => setScores((s) => ({ ...s, dp2: v }))}
            locked={!deciderNeeded}
          />

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">Screenshot URL</label>
            <input
              type="url"
              required
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://..."
              className="input-neon mt-1 h-11 w-full px-3 text-sm"
            />
          </div>

          <button
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--gradient-gold)] text-sm font-black uppercase tracking-wider text-[var(--gold-foreground)] shadow-[var(--shadow-glow-gold)] disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Submit Result</>}
          </button>
        </form>
      )}
    </div>
  );
}

function PlayerMini({ p, right }: { p: any; right?: boolean }) {
  if (!p) return <div className="text-sm text-muted-foreground">TBD</div>;
  return (
    <div className={`flex items-center gap-2 ${right ? "flex-row-reverse" : ""}`}>
      <span className="h-9 w-9 overflow-hidden rounded-full border-2 border-[var(--cyan)]">
        {p.avatar_url ? (
          <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center bg-[var(--surface-2)] text-xs font-bold text-[var(--cyan)]">
            {(p.display_name || p.username || "?").slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
      <div className="text-sm font-bold text-white">{p.display_name || p.username}</div>
    </div>
  );
}

function LegRow({
  label,
  p1,
  p2,
  onP1,
  onP2,
  locked,
}: {
  label: string;
  p1: string;
  p2: string;
  onP1: (v: string) => void;
  onP2: (v: string) => void;
  locked?: boolean;
}) {
  return (
    <div className={locked ? "opacity-50" : ""}>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">
        {label} {locked && <Lock className="h-3 w-3" />}
      </div>
      <div className="flex items-center justify-center gap-3">
        <ScoreBox value={p1} onChange={onP1} disabled={locked} />
        <span className="font-display text-2xl font-black text-[var(--cyan)]">—</span>
        <ScoreBox value={p2} onChange={onP2} disabled={locked} />
      </div>
    </div>
  );
}

function ScoreBox({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <input
      type="number"
      min={0}
      max={30}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-16 w-16 rounded-2xl border-2 border-[var(--cyan)]/60 bg-[var(--surface-2)]/60 text-center font-display text-2xl font-black text-[var(--cyan)] outline-none transition focus:border-[var(--cyan)] focus:shadow-[0_0_24px_rgba(34,211,238,0.6)] disabled:cursor-not-allowed"
      style={{ textShadow: "0 0 12px rgba(34,211,238,0.5)" }}
    />
  );
}
