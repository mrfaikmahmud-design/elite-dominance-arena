import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/sponsors")({
  component: AdminSponsors,
});

function AdminSponsors() {
  const [list, setList] = useState<any[]>([]);
  const refresh = () => supabase.from("sponsors").select("*").order("sort_order").then(({ data }) => setList(data ?? []));
  useEffect(() => { refresh(); }, []);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as any;
    const { error } = await supabase.from("sponsors").insert({
      name: fd.name,
      logo_url: fd.logo_url || null,
      website_url: fd.website_url || null,
      tier: fd.tier || "partner",
      sort_order: Number(fd.sort_order) || 0,
    });
    if (error) toast.error(error.message);
    else { toast.success("Added"); (e.currentTarget as HTMLFormElement).reset(); refresh(); }
  };
  const del = async (id: string) => { await supabase.from("sponsors").delete().eq("id", id); refresh(); };
  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Add Sponsor</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div><Label>Name</Label><Input name="name" required className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Tier</Label><Input name="tier" defaultValue="partner" className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Logo URL</Label><Input name="logo_url" type="url" className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Website URL</Label><Input name="website_url" type="url" className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Sort order</Label><Input name="sort_order" type="number" defaultValue={0} className="mt-1 border-white/10 bg-white/5" /></div>
        </div>
        <Button className="mt-5 h-11 rounded-xl bg-[var(--gradient-gold)] px-6 text-[var(--gold-foreground)]">Add</Button>
      </form>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Sponsors</h2>
        <ul className="mt-3 space-y-2">
          {list.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm">
              <div><span className="font-semibold">{s.name}</span> <span className="text-xs text-muted-foreground">· {s.tier}</span></div>
              <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
