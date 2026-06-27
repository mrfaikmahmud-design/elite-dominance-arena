import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/tournaments")({
  component: AdminTournaments,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminTournaments() {
  const [list, setList] = useState<any[]>([]);
  const refresh = () => supabase.from("tournaments").select("*").order("starts_at", { ascending: false }).then(({ data }) => setList(data ?? []));
  useEffect(() => { refresh(); }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as any;
    const payload = {
      name: fd.name,
      slug: slugify(fd.name),
      description: fd.description || null,
      entry_fee: Number(fd.entry_fee) || 0,
      prize_pool: Number(fd.prize_pool) || 0,
      max_slots: Number(fd.max_slots) || 16,
      format: fd.format,
      status: fd.status,
      rules: fd.rules || null,
      starts_at: new Date(fd.starts_at).toISOString(),
      registration_deadline: fd.registration_deadline ? new Date(fd.registration_deadline).toISOString() : null,
    };
    const { error } = await supabase.from("tournaments").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Tournament created");
      (e.currentTarget as HTMLFormElement).reset();
      refresh();
    }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this tournament? This cannot be undone.")) return;
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); refresh(); }
  };
  const setStatus = async (id: string, status: string) => {
    await supabase.from("tournaments").update({ status: status as any }).eq("id", id);
    refresh();
  };
  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Create Tournament</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div><Label>Name</Label><Input name="name" required maxLength={120} className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Starts at</Label><Input name="starts_at" type="datetime-local" required className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Entry fee (৳)</Label><Input name="entry_fee" type="number" min={0} defaultValue={0} className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Prize pool (৳)</Label><Input name="prize_pool" type="number" min={0} defaultValue={0} className="mt-1 border-white/10 bg-white/5" /></div>
          <div><Label>Max slots</Label><Input name="max_slots" type="number" min={2} defaultValue={16} className="mt-1 border-white/10 bg-white/5" /></div>
          <div>
            <Label>Format</Label>
            <select name="format" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm" defaultValue="single_elimination">
              <option value="single_elimination">Single Elimination</option>
              <option value="double_elimination">Double Elimination</option>
              <option value="round_robin">Round Robin</option>
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select name="status" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm" defaultValue="upcoming">
              {["upcoming", "registration_open", "registration_closed", "live", "completed", "cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><Label>Registration deadline</Label><Input name="registration_deadline" type="datetime-local" className="mt-1 border-white/10 bg-white/5" /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea name="description" rows={3} maxLength={1000} className="mt-1 border-white/10 bg-white/5" /></div>
          <div className="md:col-span-2"><Label>Rules</Label><Textarea name="rules" rows={4} maxLength={3000} className="mt-1 border-white/10 bg-white/5" /></div>
        </div>
        <Button className="mt-5 h-11 rounded-xl bg-[var(--gradient-gold)] px-6 text-[var(--gold-foreground)]">Create</Button>
      </form>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">All Tournaments</h2>
        <ul className="mt-3 space-y-2">
          {list.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(t.starts_at), "MMM d, yyyy")} · ৳{Number(t.prize_pool).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)} className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-xs">
                  {["upcoming", "registration_open", "registration_closed", "live", "completed", "cancelled"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <Button size="icon" variant="ghost" onClick={() => del(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </li>
          ))}
          {list.length === 0 && <li className="text-sm text-muted-foreground">No tournaments yet.</li>}
        </ul>
      </div>
    </div>
  );
}
