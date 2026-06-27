import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/PageTransition";
import { SdbdLogo } from "@/components/SdbdLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — SDBD" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [pending, setPending] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (new FormData(e.currentTarget).get("email") as string)?.trim();
    if (!email) return;
    setPending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setPending(false);
    if (error) toast.error(error.message);
    else toast.success("If an account exists, a reset link is on its way.");
  };
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center"><SdbdLogo /></div>
        <div className="glass-strong rounded-3xl border border-white/10 p-8">
          <h1 className="font-display text-3xl font-extrabold">Forgot password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll email you a secure reset link.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1 border-white/10 bg-white/5" />
            </div>
            <Button disabled={pending} className="h-11 w-full rounded-xl bg-[var(--gradient-gold)] text-[var(--gold-foreground)]">
              Send reset link
            </Button>
          </form>
          <p className="mt-4 text-center text-sm"><Link to="/auth/login" className="text-[var(--gold)]">← Back to login</Link></p>
        </div>
      </Section>
    </div>
  );
}
