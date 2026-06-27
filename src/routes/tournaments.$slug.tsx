import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Section } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trophy, Calendar, Users, DollarSign, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/tournaments/$slug")({
  component: TournamentDetail,
});

type Tournament = any;
type Registration = { id: string; user_id: string; status: string; profiles?: any };
type Fixture = any;

function TournamentDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [t, setT] = useState<Tournament | null>(null);
  const [regs, setRegs] = useState<Registration[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [myReg, setMyReg] = useState<Registration | null>(null);
  const [registering, setRegistering] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data: tour } = await supabase.from("tournaments").select("*").eq("slug", slug).maybeSingle();
    setT(tour);
    if (!tour) {
      setLoading(false);
      return;
    }
    const { data: regsData } = await supabase
      .from("registrations")
      .select("id,user_id,status,profiles:profiles!user_id(username,display_name,avatar_url,rating)")
      .eq("tournament_id", tour.id);
    setRegs((regsData as any) ?? []);
    const { data: fx } = await supabase
      .from("fixtures")
      .select("*,p1:profiles!fixtures_player1_id_fkey(username,display_name),p2:profiles!fixtures_player2_id_fkey(username,display_name)")
      .eq("tournament_id", tour.id)
      .order("round", { ascending: true });
    setFixtures((fx as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [slug]);

  useEffect(() => {
    if (!user || !regs.length) return setMyReg(null);
    setMyReg(regs.find((r) => r.user_id === user.id) ?? null);
  }, [user, regs]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }
  if (!t) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Tournament not found</h1>
        <Link to="/tournaments" className="mt-4 inline-block text-[var(--gold)]">← Back to all tournaments</Link>
      </div>
    );
  }

  const register = async () => {
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }
    setRegistering(true);
    const { error } = await supabase.from("registrations").insert({ tournament_id: t.id, user_id: user.id });
    setRegistering(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Registration submitted! Awaiting approval.");
      refresh();
    }
  };

  const slotsLeft = t.max_slots - regs.filter((r) => r.status === "approved").length;
  const isOpen = t.status === "registration_open" || t.status === "upcoming";

  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-6xl">
        <Link to="/tournaments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All tournaments
        </Link>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="glass-strong relative overflow-hidden rounded-3xl border border-white/10 p-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,oklch(0.88_0.16_90/0.2),transparent_60%)]" />
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--ice)]">
              {format(new Date(t.starts_at), "EEEE, MMM d, yyyy · p")}
            </div>
            <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">{t.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">
                {t.status.replaceAll("_", " ")}
              </span>
              <span className="rounded-full border border-[var(--ice)]/30 bg-[var(--ice)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ice)]">
                {t.format.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-4 whitespace-pre-line text-muted-foreground">{t.description || "Premium SDBD solo eFootball tournament."}</p>

            <Tabs defaultValue="rules" className="mt-8">
              <TabsList className="glass">
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="bracket">Bracket</TabsTrigger>
                <TabsTrigger value="prize">Prize</TabsTrigger>
              </TabsList>
              <TabsContent value="rules" className="prose prose-invert mt-4 max-w-none whitespace-pre-line text-sm text-muted-foreground">
                {t.rules || "Standard SDBD rules apply. Best of 1, 6-minute halves, default settings. Screenshot proof required for every win. Disputes reviewed by SDBD moderators."}
              </TabsContent>
              <TabsContent value="participants" className="mt-4">
                {regs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No participants yet. Be the first to register.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {regs.map((r) => (
                      <div key={r.id} className="glass flex items-center justify-between rounded-xl p-3">
                        <div>
                          <div className="text-sm font-medium">{r.profiles?.display_name || r.profiles?.username || "Player"}</div>
                          <div className="text-xs text-muted-foreground">@{r.profiles?.username} · Rating {r.profiles?.rating}</div>
                        </div>
                        <span className={`text-xs uppercase ${r.status === "approved" ? "text-[var(--gold)]" : "text-muted-foreground"}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="bracket" className="mt-4">
                {fixtures.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Bracket will appear once registration closes.</p>
                ) : (
                  <BracketView fixtures={fixtures} />
                )}
              </TabsContent>
              <TabsContent value="prize" className="mt-4">
                <ul className="space-y-2 text-sm">
                  {(Array.isArray(t.prize_distribution) ? t.prize_distribution : []).map((p: any, i: number) => (
                    <li key={i} className="glass flex items-center justify-between rounded-xl p-3">
                      <span>{p.place}</span>
                      <span className="font-display text-[var(--gold)]">৳{Number(p.amount).toLocaleString()}</span>
                    </li>
                  ))}
                  {(!t.prize_distribution || (t.prize_distribution as any[]).length === 0) && (
                    <li className="text-muted-foreground">Total prize pool: ৳{Number(t.prize_pool).toLocaleString()}</li>
                  )}
                </ul>
              </TabsContent>
            </Tabs>
          </div>

          {/* sidebar */}
          <aside className="space-y-4">
            <div className="glass-strong rounded-2xl border border-white/10 p-6">
              <div className="space-y-4">
                <Info icon={DollarSign} label="Prize Pool" value={`৳${Number(t.prize_pool).toLocaleString()}`} />
                <Info icon={Trophy} label="Entry Fee" value={t.entry_fee > 0 ? `৳${t.entry_fee}` : "Free"} />
                <Info icon={Users} label="Slots Remaining" value={`${Math.max(0, slotsLeft)} / ${t.max_slots}`} />
                <Info icon={Calendar} label="Starts" value={format(new Date(t.starts_at), "MMM d, p")} />
              </div>
              <div className="mt-6">
                {myReg ? (
                  <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-3 text-center text-sm">
                    <Shield className="mx-auto mb-1 h-4 w-4 text-[var(--gold)]" />
                    You're registered · <span className="font-semibold text-[var(--gold)]">{myReg.status}</span>
                  </div>
                ) : (
                  <Button
                    disabled={!isOpen || registering || slotsLeft <= 0}
                    onClick={register}
                    className="h-11 w-full rounded-xl bg-[var(--gradient-gold)] text-[var(--gold-foreground)] shadow-[var(--shadow-glow-gold)]"
                  >
                    {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : isOpen ? "Register Now" : "Registration Closed"}
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-[var(--gold)]" /> {label}
      </div>
      <div className="font-display font-bold">{value}</div>
    </div>
  );
}

function BracketView({ fixtures }: { fixtures: any[] }) {
  const rounds = Array.from(new Set(fixtures.map((f) => f.round))).sort();
  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      {rounds.map((r) => (
        <div key={r} className="min-w-[220px] space-y-3">
          <div className="text-xs uppercase tracking-wider text-[var(--ice)]">Round {r}</div>
          {fixtures.filter((f) => f.round === r).map((f) => (
            <div key={f.id} className="glass rounded-xl p-3 text-xs">
              <Row name={f.p1?.display_name || f.p1?.username || "TBD"} score={f.player1_score} winner={f.winner_id === f.player1_id} />
              <Row name={f.p2?.display_name || f.p2?.username || "TBD"} score={f.player2_score} winner={f.winner_id === f.player2_id} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
function Row({ name, score, winner }: { name: string; score: number | null; winner: boolean }) {
  return (
    <div className={`flex items-center justify-between border-b border-white/5 py-1 last:border-0 ${winner ? "text-[var(--gold)] font-semibold" : ""}`}>
      <span className="truncate">{name}</span>
      <span>{score ?? "—"}</span>
    </div>
  );
}
