import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/PageTransition";
import { SdbdLogo } from "@/components/SdbdLogo";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Login — SDBD" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(6).max(72),
});

function LoginPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as any;
    const parsed = schema.safeParse(data);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="px-6 py-12">
      <Section className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center"><SdbdLogo /></div>
        <div className="glass-strong rounded-3xl border border-white/10 p-8">
          <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue dominating.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={200} className="mt-1 border-white/10 bg-white/5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} maxLength={72} className="mt-1 border-white/10 bg-white/5" />
            </div>
            <Button disabled={pending} type="submit" className="h-11 w-full rounded-xl bg-[var(--gradient-gold)] text-[var(--gold-foreground)] shadow-[var(--shadow-glow-gold)]">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot password?</Link>
            <Link to="/auth/register" className="text-[var(--gold)]">Create account →</Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
