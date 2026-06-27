import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/PageTransition";
import { SdbdLogo } from "@/components/SdbdLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set New Password — SDBD" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = new FormData(e.currentTarget).get("password") as string;
    if (!pw || pw.length < 8) return toast.error("Min 8 characters");
    setPending(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate({ to: "/dashboard" });
  };
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center"><SdbdLogo /></div>
        <div className="glass-strong rounded-3xl border border-white/10 p-8">
          <h1 className="font-display text-3xl font-extrabold">Set new password</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" required minLength={8} className="mt-1 border-white/10 bg-white/5" />
            </div>
            <Button disabled={pending} className="h-11 w-full rounded-xl bg-[var(--gradient-gold)] text-[var(--gold-foreground)]">Save password</Button>
          </form>
        </div>
      </Section>
    </div>
  );
}
