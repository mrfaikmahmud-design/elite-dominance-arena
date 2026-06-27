import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/PageTransition";
import { Trophy, Shield, Zap, Users, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About SDBD" }, { name: "description", content: "About Solo Dominator BD — Bangladesh's premier eFootball solo tournament platform." }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-4xl">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--ice)]">About</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold md:text-6xl">
          We're building the home of <span className="text-gradient-gold">solo eFootball</span> in Bangladesh.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          SDBD — Solo Dominator BD — is a community-first esports platform created for serious eFootball players who want
          real competition, transparent results, and prizes worth playing for. We exist to make every match count.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[
            { icon: Trophy, title: "Real prizes", body: "Every tournament has a transparent prize pool paid directly to champions." },
            { icon: Shield, title: "Fair play", body: "Screenshot-verified results, neutral moderators, and an appeals process." },
            { icon: Zap, title: "Live brackets", body: "Single, double elimination and round robin auto-generation." },
            { icon: Users, title: "Community", body: "Discord-first community, weekly leaderboards, monthly champions." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass rounded-2xl p-6">
              <Icon className="mb-3 h-6 w-6 text-[var(--gold)]" />
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
        <div className="glass-strong mt-12 rounded-3xl border border-[var(--gold)]/20 p-8 text-center">
          <h3 className="font-display text-2xl font-bold">Want to compete?</h3>
          <p className="mt-2 text-muted-foreground">Create your account and register for the next open tournament.</p>
          <Link to="/auth/register" className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--gradient-gold)] px-6 text-sm font-semibold text-[var(--gold-foreground)] shadow-[var(--shadow-glow-gold)]">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </div>
  );
}
