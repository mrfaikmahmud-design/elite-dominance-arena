import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/PageTransition";
import { format } from "date-fns";
import { Calendar, Trophy, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/tournaments/")({
  head: () => ({
    meta: [
      { title: "Tournaments — SDBD" },
      { name: "description", content: "Browse upcoming, live and completed eFootball solo tournaments on SDBD." },
      { property: "og:title", content: "Tournaments — SDBD" },
    ],
  }),
  component: TournamentsPage,
});

type Tournament = {
  id: string;
  name: string;
  slug: string;
  prize_pool: number;
  entry_fee: number;
  starts_at: string;
  status: string;
  max_slots: number;
  banner_url: string | null;
  format: string;
};

function TournamentsPage() {
  const [list, setList] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tournaments")
      .select("*")
      .order("starts_at", { ascending: true })
      .then(({ data }) => {
        setList((data as Tournament[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = list.filter(
    (t) =>
      (filter === "all" || t.status === filter) &&
      t.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-6xl">
        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--ice)]">SDBD · Battles</div>
        <h1 className="font-display text-4xl font-bold md:text-6xl">
          <span className="text-gradient-gold">Tournaments</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pick your battlefield. Register, climb the bracket, and chase the trophy.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tournaments..."
            className="max-w-sm border-white/10 bg-white/5"
          />
          <div className="flex flex-wrap gap-2">
            {["all", "registration_open", "upcoming", "live", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                  filter === s
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass h-56 animate-shimmer rounded-2xl" />
              ))
            : filtered.length === 0
            ? (
              <div className="glass col-span-full rounded-2xl p-12 text-center text-muted-foreground">
                No tournaments match your filters.
              </div>
            )
            : filtered.map((t) => <Card key={t.id} t={t} />)}
        </div>
      </Section>
    </div>
  );
}

function Card({ t }: { t: Tournament }) {
  return (
    <Link to="/tournaments/$slug" params={{ slug: t.slug }}>
      <motion.div
        whileHover={{ y: -4 }}
        className="glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 transition hover:border-[var(--gold)]/40 hover:shadow-[var(--shadow-glow-gold)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-[var(--ice)]">
              <Calendar className="mr-1 inline h-3 w-3" />
              {format(new Date(t.starts_at), "MMM d, yyyy")}
            </div>
            <h3 className="mt-1 line-clamp-1 font-display text-lg font-bold">{t.name}</h3>
          </div>
          <span className="rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">
            {t.status.replace("_", " ")}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <S label="Prize" value={`৳${Number(t.prize_pool).toLocaleString()}`} icon={Trophy} />
          <S label="Entry" value={t.entry_fee > 0 ? `৳${t.entry_fee}` : "Free"} />
          <S label="Slots" value={String(t.max_slots)} icon={Users} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground capitalize">{t.format.replaceAll("_", " ")}</span>
          <span className="inline-flex items-center text-sm font-medium text-[var(--gold)] transition group-hover:translate-x-1">
            Details <ArrowRight className="ml-1.5 h-4 w-4" />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

function S({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] py-2">
      <div className="flex items-center justify-center gap-1 font-display text-sm font-bold">
        {Icon && <Icon className="h-3 w-3 text-[var(--gold)]" />}
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
