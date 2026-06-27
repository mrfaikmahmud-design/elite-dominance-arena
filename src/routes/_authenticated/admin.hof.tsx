import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hof")({
  component: AdminHof,
});

function AdminHof() {
  const [list, setList] = useState<any[]>([]);
  const refresh = () => supabase.from("hall_of_fame").select("*").order("won_on", { ascending: false }).then(({ data }) => setList(data ?? []));
  useEffect(() => { refresh(); }, []);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as any;
    const { error } = await supabase.from("hall_of_fame").insert({
      champion_name: fd.champion_name,
      tournament_name: fd.tournament_name,
      won_on: fd.won_on,
      prize: fd.prize ? Number(fd.prize) : null,
      champion_photo_url: fd.champion_photo_url || null,
      notes: fd.notes || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Added"); (e.currentTarget as HTMLFormElement).reset(); refresh(); }
  };
  const del = async (id: string) => { await supabase.from("hall_of_fame").delete().eq("id", id); refresh(); };
  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Crown a Champion</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div><Label>Champion name</Label><Input name="champion_name" required className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Tournament name</Label><Input name="tournament_name" required className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Won on</Label><Input name="won_on" type="date" required className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Prize (৳)</Label><Input name="prize" type="number" className="mt-1 border-white/10 bg-white/5" /></div>
          <div className="md:col-span-2"><Label>Photo URL</Label><Input name="champion_photo_url" type="url" className="mt-1 border-white/10 bg-white/5" /></div>
          <div className="md:col-span-2"><Label>Notes</Label><Input name="notes" className="mt-1 border-white/10 bg-white/5" /></div>
        </div>
        <Button className="mt-5 h-11 rounded-xl bg-[var(--gradient-gold)] px-6 text-[var(--gold-foreground)]">Add</Button>
      </form>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Champions</h2>
        <ul className="mt-3 space-y-2">
          {list.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm">
              <div><span className="font-semibold">{c.champion_name}</span> — {c.tournament_name}</div>
              <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
