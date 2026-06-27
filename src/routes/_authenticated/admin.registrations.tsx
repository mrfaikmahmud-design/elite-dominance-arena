import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/registrations")({
  component: AdminRegs,
});

function AdminRegs() {
  const [list, setList] = useState<any[]>([]);
  const refresh = () =>
    supabase
      .from("registrations")
      .select("*,tournament:tournaments(name,slug),profile:profiles!user_id(username,display_name,rating)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setList(data ?? []));
  useEffect(() => { refresh(); }, []);
  const setStatus = async (id: string, status: string, userId: string, tournamentName: string) => {
    const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    // notification
    await supabase.from("notifications").insert({
      user_id: userId,
      title: status === "approved" ? "Registration Approved" : "Registration Update",
      body: `Your registration for ${tournamentName} is now ${status}.`,
      type: status === "approved" ? "success" : "info",
    });
    toast.success("Updated");
    refresh();
  };
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold">Registrations</h2>
      <ul className="mt-3 space-y-2">
        {list.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{r.profile?.display_name || r.profile?.username}</div>
              <div className="text-xs text-muted-foreground">@{r.profile?.username} · Rating {r.profile?.rating} · {r.tournament?.name}</div>
              {r.fb_post_link && (
                <a href={r.fb_post_link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--cyan)] underline">
                  View FB post ↗
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase ${r.status === "approved" ? "text-[var(--gold)]" : "text-muted-foreground"}`}>{r.status}</span>
              {r.status !== "approved" && <Button size="sm" onClick={() => setStatus(r.id, "approved", r.user_id, r.tournament?.name)} className="bg-[var(--gradient-gold)] text-[var(--gold-foreground)]">Approve</Button>}
              {r.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected", r.user_id, r.tournament?.name)}>Reject</Button>}
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="text-sm text-muted-foreground">No registrations yet.</li>}
      </ul>
    </div>
  );
}
