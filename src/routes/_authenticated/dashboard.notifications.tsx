import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    const load = () => supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setList(data ?? []));
    load();
    const ch = supabase
      .channel("notif_" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);
  const markAll = async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user!.id).eq("read", false);
  };
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Notifications</h2>
        {list.some((n) => !n.read) && (
          <button onClick={markAll} className="inline-flex items-center gap-1 text-xs text-[var(--gold)]">
            <Check className="h-3 w-3" /> Mark all read
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground"><Bell className="mr-1 inline h-4 w-4" /> You're all caught up.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.map((n) => (
            <li key={n.id} className={`rounded-xl border p-4 ${n.read ? "border-white/5 bg-white/[0.02]" : "border-[var(--gold)]/30 bg-[var(--gold)]/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{n.title}</div>
                  {n.body && <div className="mt-1 text-sm text-muted-foreground">{n.body}</div>}
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
