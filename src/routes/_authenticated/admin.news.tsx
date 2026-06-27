import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/news")({
  component: AdminNews,
});

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function AdminNews() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const refresh = () => supabase.from("news").select("*").order("created_at", { ascending: false }).then(({ data }) => setList(data ?? []));
  useEffect(() => { refresh(); }, []);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as any;
    const { error } = await supabase.from("news").insert({
      title: fd.title,
      slug: slugify(fd.title) + "-" + Math.random().toString(36).slice(2, 6),
      excerpt: fd.excerpt || null,
      content: fd.content,
      category: fd.category || "announcement",
      cover_url: fd.cover_url || null,
      author_id: user?.id,
    });
    if (error) toast.error(error.message);
    else { toast.success("Published"); (e.currentTarget as HTMLFormElement).reset(); refresh(); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("news").delete().eq("id", id);
    refresh();
  };
  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Publish News</h2>
        <div className="mt-4 space-y-4">
          <div><Label>Title</Label><Input name="title" required maxLength={140} className="mt-1 border-white/10 bg-white/5" /></div>
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label>Category</Label><Input name="category" defaultValue="announcement" className="mt-1 border-white/10 bg-white/5" /></div>
            <div><Label>Cover URL</Label><Input name="cover_url" type="url" className="mt-1 border-white/10 bg-white/5" /></div>
          </div>
          <div><Label>Excerpt</Label><Input name="excerpt" maxLength={240} className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Content</Label><Textarea name="content" required rows={8} maxLength={10000} className="mt-1 border-white/10 bg-white/5" /></div>
        </div>
        <Button className="mt-5 h-11 rounded-xl bg-[var(--gradient-gold)] px-6 text-[var(--gold-foreground)]">Publish</Button>
      </form>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Posts</h2>
        <ul className="mt-3 space-y-2">
          {list.map((n) => (
            <li key={n.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm">
              <div className="font-semibold">{n.title}</div>
              <Button size="icon" variant="ghost" onClick={() => del(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
