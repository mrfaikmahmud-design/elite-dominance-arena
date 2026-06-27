import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/PageTransition";
import { Trophy, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export const Route = createFileRoute("/hall-of-fame")({
  head: () => ({ meta: [{ title: "Hall of Fame — SDBD" }, { name: "description", content: "SDBD champions through the ages." }] }),
  component: HofPage,
});

function HofPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("hall_of_fame").select("*").order("won_on", { ascending: false }).then(({ data }) => setList(data ?? []));
  }, []);
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-6xl text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <Trophy className="mx-auto h-24 w-24 text-[var(--gold)] drop-shadow-[0_0_30px_oklch(0.88_0.16_90/0.6)]" />
        </motion.div>
        <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">
          <span className="text-gradient-gold">Hall of Fame</span>
        </h1>
        <p className="mt-3 text-muted-foreground">Champions who etched their names in SDBD history.</p>
      </Section>
      <Section className="mx-auto mt-12 max-w-6xl">
        {list.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">The throne awaits its first champion.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-strong group relative overflow-hidden rounded-2xl border border-[var(--gold)]/20 p-6 hover:shadow-[var(--shadow-glow-gold)]"
              >
                <div className="absolute right-3 top-3"><Trophy className="h-5 w-5 text-[var(--gold)]" /></div>
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[var(--gradient-gold)] text-2xl font-extrabold text-[var(--gold-foreground)] shadow-[var(--shadow-glow-gold)]">
                  {c.champion_name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{c.champion_name}</h3>
                <p className="mt-1 text-sm text-[var(--ice)]">{c.tournament_name}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span><Calendar className="mr-1 inline h-3 w-3" /> {format(new Date(c.won_on), "MMM yyyy")}</span>
                  {c.prize && <span className="font-display font-bold text-[var(--gold)]">৳{Number(c.prize).toLocaleString()}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
