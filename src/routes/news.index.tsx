import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/PageTransition";
import { format } from "date-fns";
import { motion } from "framer-motion";

export const Route = createFileRoute("/news/")({
  head: () => ({ meta: [{ title: "News — SDBD" }, { name: "description", content: "Latest SDBD announcements, results, and esports news." }] }),
  component: NewsList,
});

function NewsList() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("news").select("*").eq("published", true).order("created_at", { ascending: false }).then(({ data }) => setList(data ?? []));
  }, []);
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-5xl">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--ice)]">Latest Drops</div>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-6xl"><span className="text-gradient-gold">News</span></h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {list.length === 0 && <div className="glass col-span-full rounded-2xl p-10 text-center text-muted-foreground">No news posts yet.</div>}
          {list.map((n, i) => (
            <Link to="/news/$slug" params={{ slug: n.slug }} key={n.id}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass group h-full rounded-2xl border border-white/10 p-6 transition hover:border-[var(--ice)]/40 hover:shadow-[var(--shadow-glow-ice)]">
                <div className="text-xs uppercase tracking-wider text-[var(--ice)]">{n.category || "News"} · {format(new Date(n.created_at), "MMM d")}</div>
                <h2 className="mt-2 font-display text-xl font-bold group-hover:text-[var(--gold)]">{n.title}</h2>
                {n.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{n.excerpt}</p>}
                <div className="mt-4 text-sm text-[var(--gold)]">Read more →</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
