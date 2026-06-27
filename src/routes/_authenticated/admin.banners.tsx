import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: AdminBanners,
});

function AdminBanners() {
  const [list, setList] = useState<any[]>([]);
  const refresh = () => supabase.from("hero_banners").select("*").order("sort_order").then(({ data }) => setList(data ?? []));
  useEffect(() => { refresh(); }, []);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as any;
    const { error } = await supabase.from("hero_banners").insert({
      title: fd.title,
      subtitle: fd.subtitle || null,
      cta_label: fd.cta_label || null,
      cta_url: fd.cta_url || null,
      countdown_to: fd.countdown_to ? new Date(fd.countdown_to).toISOString() : null,
      image_url: fd.image_url || null,
      sort_order: Number(fd.sort_order) || 0,
      active: true,
    });
    if (error) toast.error(error.message);
    else { toast.success("Banner added"); (e.currentTarget as HTMLFormElement).reset(); refresh(); }
  };
  const del = async (id: string) => { await supabase.from("hero_banners").delete().eq("id", id); refresh(); };
  const toggle = async (id: string, active: boolean) => { await supabase.from("hero_banners").update({ active: !active }).eq("id", id); refresh(); };
  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Add Hero Banner</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div><Label>Title</Label><Input name="title" required className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Subtitle</Label><Input name="subtitle" className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>CTA label</Label><Input name="cta_label" className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>CTA URL</Label><Input name="cta_url" type="url" className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Countdown to</Label><Input name="countdown_to" type="datetime-local" className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Sort order</Label><Input name="sort_order" type="number" defaultValue={0} className="mt-1 border-white/10 bg-white/5" /></div>
          <div className="md:col-span-2"><Label>Image URL</Label><Input name="image_url" type="url" className="mt-1 border-white/10 bg-white/5" /></div>
        </div>
        <Button className="mt-5 h-11 rounded-xl bg-[var(--gradient-gold)] px-6 text-[var(--gold-foreground)]">Add</Button>
      </form>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Banners</h2>
        <ul className="mt-3 space-y-2">
          {list.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm">
              <div>
                <div className="font-semibold">{b.title}</div>
                <div className="text-xs text-muted-foreground">{b.subtitle}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(b.id, b.active)}>{b.active ? "Hide" : "Show"}</Button>
                <Button size="icon" variant="ghost" onClick={() => del(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
