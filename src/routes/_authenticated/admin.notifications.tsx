import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: AdminNotify,
});

function AdminNotify() {
  const [pending, setPending] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as any;
    setPending(true);
    const { data: users } = await supabase.from("profiles").select("id");
    const rows = (users ?? []).map((u) => ({ user_id: u.id, title: fd.title, body: fd.body, type: "info" }));
    if (rows.length === 0) { setPending(false); return toast.error("No users to notify"); }
    const { error } = await supabase.from("notifications").insert(rows);
    setPending(false);
    if (error) toast.error(error.message);
    else { toast.success(`Broadcasted to ${rows.length} players`); (e.currentTarget as HTMLFormElement).reset(); }
  };
  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold">Broadcast Notification</h2>
      <p className="mt-1 text-sm text-muted-foreground">Send a notification to every registered player.</p>
      <div className="mt-4 space-y-3">
        <div><Label>Title</Label><Input name="title" required maxLength={120} className="mt-1 border-white/10 bg-white/5" /></div>
        <div><Label>Body</Label><Textarea name="body" required rows={4} maxLength={500} className="mt-1 border-white/10 bg-white/5" /></div>
      </div>
      <Button disabled={pending} className="mt-5 h-11 rounded-xl bg-[var(--gradient-gold)] px-6 text-[var(--gold-foreground)]">Broadcast</Button>
    </form>
  );
}
