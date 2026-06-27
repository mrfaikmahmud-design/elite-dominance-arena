import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { UserPlus, LogIn, Trophy, Calendar, ChevronRight, Handshake, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInSeconds } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SDBD — eFootball Ultimate Solo Hub" },
      { name: "description", content: "SDBD — Bangladesh's elite eFootball solo tournament hub. Sign up, log in, track rankings and join live fixtures." },
      { property: "og:title", content: "SDBD — Solo Dominator BD" },
    ],
  }),
  component: HomePage,
});

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
  countdown_to: string | null;
  image_url: string | null;
};

function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [tournament, setTournament] = useState<{ name: string; slug: string; banner_url: string | null; starts_at: string } | null>(null);

  useEffect(() => {
    supabase
      .from("hero_banners")
      .select("id,title,subtitle,cta_label,cta_url,countdown_to,image_url")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setBanners((data as Banner[]) ?? []));
    supabase
      .from("tournaments")
      .select("name,slug,banner_url,starts_at")
      .order("starts_at", { ascending: true })
      .limit(1)
      .then(({ data }) => setTournament((data?.[0] as any) ?? null));
  }, []);

  return (
    <div className="px-4 pb-16 pt-6 md:px-6">
      <div className="mx-auto max-w-md md:max-w-2xl">
        {/* HERO BANNER CAROUSEL */}
        <BannerCarousel banners={banners} tournament={tournament} />

        {/* TILE GRID */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Tile to="/auth/register" label="Player" sub="Sign-Up" Icon={UserPlus} color="cyan" />
          <Tile to="/auth/login" label="Player" sub="Log-In" Icon={LogIn} color="purple" />
          <Tile to="/leaderboard" label="Player" sub="Rankings" Icon={Trophy} color="gold" />
          <Tile to="/fixtures" label="Fixture" sub="" Icon={Calendar} color="red" />
        </div>

        {/* OFFICIAL PARTNERS */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[var(--cyan)]">
            <Handshake className="h-3.5 w-3.5" /> Official Partners
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {["Konami", "eFootball", "SDBD Esports"].map((s) => (
              <div key={s} className="glass rounded-2xl px-2 py-4 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="mt-8 space-y-3">
          <QuickRow to="/hall-of-fame" label="Hall of Fame" sub="Past champions" />
          <QuickRow to="/news" label="Latest News" sub="Announcements & updates" />
          <QuickRow to="/players" label="Player Directory" sub="Browse community" />
        </div>

        {/* FOOTER BADGE */}
        <div className="mt-10 flex justify-center">
          <div className="rounded-full border border-cyan/30 bg-[var(--surface)]/60 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--cyan)]">
            DEVELOPED BY MR FAIK MAHMUD&nbsp;
          </div>
        </div>
      </div>
    </div>
  );
}

const colorMap: Record<string, { neon: string; text: string; icon: string }> = {
  cyan: { neon: "neon-cyan", text: "text-[var(--cyan)]", icon: "from-cyan-300 to-cyan-600" },
  purple: { neon: "neon-purple", text: "text-[#c084fc]", icon: "from-purple-300 to-purple-600" },
  gold: { neon: "neon-gold", text: "text-[var(--gold)]", icon: "from-amber-300 to-orange-500" },
  red: { neon: "neon-red", text: "text-[#f87171]", icon: "from-red-400 to-red-700" },
};

function Tile({ to, label, sub, Icon, color }: { to: string; label: string; sub: string; Icon: any; color: keyof typeof colorMap }) {
  const c = colorMap[color];
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`tile-emboss relative aspect-square overflow-hidden rounded-3xl bg-[var(--surface-2)]/70 p-4 ${c.neon}`}
      >
        {/* corner screws */}
        {[
          "top-2 left-2",
          "top-2 right-2",
          "bottom-2 left-2",
          "bottom-2 right-2",
        ].map((p) => (
          <span key={p} className={`absolute ${p} h-1.5 w-1.5 rounded-full bg-white/30 shadow-[inset_0_0_2px_rgba(0,0,0,0.6)]`} />
        ))}
        <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${c.icon} shadow-[0_0_20px_rgba(34,211,238,0.45)]`}>
          <Icon className="h-6 w-6 text-[var(--background)]" strokeWidth={2.5} />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`font-display text-xl font-extrabold leading-tight ${c.text}`} style={{ textShadow: "0 0 16px currentColor" }}>
            {label.toUpperCase()}
          </div>
          {sub && (
            <div className={`font-display text-xl font-extrabold leading-tight ${c.text}`} style={{ textShadow: "0 0 16px currentColor" }}>
              {sub.toUpperCase()}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

function QuickRow({ to, label, sub }: { to: string; label: string; sub: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-2xl border border-cyan/20 bg-[var(--surface)]/60 px-4 py-3 transition hover:border-cyan/50"
    >
      <div>
        <div className="text-sm font-bold uppercase tracking-wider text-[var(--cyan)]">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <ChevronRight className="h-5 w-5 text-[var(--cyan)] transition group-hover:translate-x-1" />
    </Link>
  );
}

function BannerCarousel({ banners, tournament }: { banners: Banner[]; tournament: any }) {
  const slides = [
    ...(tournament
      ? [
          {
            id: "tour",
            title: tournament.name,
            subtitle: "Upcoming Tournament",
            cta_url: `/tournaments/${tournament.slug}`,
            cta_label: "View",
            image_url: tournament.banner_url,
            countdown_to: tournament.starts_at,
            isTournament: true as const,
          },
        ]
      : []),
    ...banners.map((b) => ({ ...b, isTournament: false as const })),
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="neon-cyan relative aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1f3a] to-[#050a18]">
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--cyan)]">
              eFootball
            </div>
            <div
              className="mt-1 font-display text-5xl font-black tracking-wider text-gradient-cyan"
              style={{ textShadow: "0 0 30px rgba(34,211,238,0.6)" }}
            >
              SDBD
            </div>
            <div className="text-[10px] font-semibold tracking-[0.3em] text-[var(--cyan)]/80">
              eFootball Ultimate Solo Hub
            </div>
            <div className="mt-3 inline-block rounded-md border border-[var(--cyan)]/40 bg-[var(--surface)]/60 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[var(--cyan)]">
              ESTD · 2026
            </div>
          </div>
        </div>
      </div>
    );
  }

  const s = slides[i];
  return (
    <div className="neon-cyan relative aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1f3a] to-[#050a18]">
      <motion.div
        key={s.id}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0"
      >
        {s.image_url ? (
          <>
            <img src={s.image_url} alt={s.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a18] via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Sparkles className="h-10 w-10 text-[var(--cyan)] opacity-40" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4">
          {s.isTournament && (
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[var(--surface)]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--cyan)] backdrop-blur">
              <Calendar className="h-3 w-3" /> Upcoming Tournament
            </div>
          )}
          <div className="font-display text-lg font-extrabold text-white drop-shadow-md md:text-2xl">{s.title}</div>
          {s.cta_url && s.cta_label && (
            <Link
              to={s.cta_url as any}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--gradient-gold)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--gold-foreground)]"
            >
              {s.cta_label} <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </motion.div>
      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-[var(--cyan)]" : "w-2 bg-white/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
