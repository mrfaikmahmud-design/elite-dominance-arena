import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/PageTransition";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/news/$slug")({ component: NewsDetail });

function NewsDetail() {
  const { slug } = Route.useParams();
  const [n, setN] = useState<any>(null);
  useEffect(() => {
    supabase.from("news").select("*").eq("slug", slug).maybeSingle().then(({ data }) => setN(data));
  }, [slug]);
  if (!n) return <div className="py-24 text-center text-muted-foreground">Loading...</div>;
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-3xl">
        <Link to="/news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All news
        </Link>
        <article className="glass-strong mt-6 rounded-3xl border border-white/10 p-8 md:p-12">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--ice)]">{n.category || "Announcement"} · {format(new Date(n.created_at), "MMM d, yyyy")}</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold md:text-5xl">{n.title}</h1>
          {n.excerpt && <p className="mt-4 text-lg text-muted-foreground">{n.excerpt}</p>}
          <div className="prose prose-invert mt-8 max-w-none whitespace-pre-line text-foreground/90">{n.content}</div>
        </article>
      </Section>
    </div>
  );
}
