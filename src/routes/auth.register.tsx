import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, Moon, Copy, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Player Sign-Up — SDBD" }] }),
  component: RegisterPage,
});

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function RegisterPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!fd.email || !fd.password) return toast.error("Email and password required");
    if (fd.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (!fd.fb_name) return toast.error("Official FB name is required");
    setPending(true);

    const username = (fd.fb_name || fd.email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "player" + Math.floor(Math.random() * 9999);

    const { data, error } = await supabase.auth.signUp({
      email: fd.email,
      password: fd.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username, display_name: fd.fb_name },
      },
    });
    if (error || !data.user) {
      setPending(false);
      return toast.error(error?.message || "Sign-up failed");
    }
    await supabase
      .from("profiles")
      .update({
        fb_name: fd.fb_name,
        contact_number: fd.contact_number || null,
        fb_profile_link: fd.fb_profile_link || null,
        country: fd.country || "Bangladesh",
        dob: fd.dob || null,
        district: fd.district || null,
        current_location: fd.current_location || null,
        playing_device: fd.playing_device || null,
        konami_uid: fd.konami_uid || null,
        blood_group: fd.blood_group || null,
        avatar_url: fd.avatar_url || null,
      })
      .eq("id", data.user.id);

    // Fetch the private recovery code generated for this player
    const { data: code } = await supabase.rpc("get_recovery_code", { _user_id: data.user.id });
    setPending(false);
    if (code) {
      setRecoveryCode(code as string);
    } else {
      toast.success("Welcome to SDBD!");
      navigate({ to: "/dashboard" });
    }
  };



  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="neon-cyan relative overflow-hidden rounded-3xl bg-[var(--surface)]/70 p-6 backdrop-blur-xl">
          {/* header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-[var(--surface-2)]/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--cyan)]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <h1
              className="font-display text-2xl font-black text-gradient-cyan"
              style={{ textShadow: "0 0 18px rgba(34,211,238,0.5)" }}
            >
              Player Sign-Up
            </h1>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-cyan/40 bg-[var(--surface-2)]/60 text-[var(--cyan)]">
              <Moon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Join the <span className="text-[var(--cyan)] font-semibold">SDBD eFootball Ultimate Solo Hub</span>
          </p>


          <form onSubmit={onSubmit} className="space-y-4">
            <NeonField label="Email" name="email" type="email" placeholder="you@email.com" required />
            <NeonField label="Password" name="password" type="password" placeholder="At least 8 characters" required minLength={8} />
            <NeonField label="Official FB Name" name="fb_name" placeholder="e.g. Mahedi Hasan" required />
            <NeonField label="Contact Number" name="contact_number" placeholder="+880..." />
            <NeonField label="FB Profile Link" name="fb_profile_link" type="url" placeholder="https://facebook.com/..." />
            <NeonField label="Country" name="country" defaultValue="Bangladesh" />
            <NeonField label="Date of Birth" name="dob" type="date" />
            <NeonField label="District" name="district" placeholder="e.g. Dhaka" />
            <NeonField label="Current Location" name="current_location" placeholder="City / Area" />
            <NeonField label="Playing Device" name="playing_device" placeholder="e.g. iPhone 15 Pro, Galaxy S24, PC" />
            <NeonField label="Konami UID" name="konami_uid" placeholder="XXX-XXX-XXX" />
            <NeonSelect label="Blood Group" name="blood_group">
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </NeonSelect>
            <NeonField label="Profile Photo URL" name="avatar_url" type="url" placeholder="https://... (optional)" />

            <button
              disabled={pending}
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--gradient-cyan)] text-base font-black uppercase tracking-wider text-[var(--background)] shadow-[var(--shadow-glow-cyan)] disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register Player"}
            </button>
          </form>

          {recoveryCode && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-6 backdrop-blur-sm">
              <div className="neon-gold relative max-w-md rounded-3xl bg-[var(--surface)]/95 p-6">
                <div className="flex items-center gap-2 text-[var(--gold)]">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="font-display text-xl font-black uppercase tracking-wider">Your Recovery Code</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Save this code somewhere safe. Only <b>you</b> and an <b>SDBD admin</b> can see it. If you ever lose
                  your password, share this exact code with the admin to recover access.
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--gold)]/40 bg-[var(--surface-2)] px-4 py-3 font-mono text-lg font-black tracking-[0.3em] text-[var(--gold)]">
                  {recoveryCode}
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(recoveryCode!); toast.success("Copied"); }}
                    className="rounded-md border border-[var(--gold)]/40 p-1.5 text-[var(--gold)]"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => { setRecoveryCode(null); navigate({ to: "/dashboard" }); }}
                  className="mt-5 h-11 w-full rounded-xl bg-[var(--gradient-cyan)] text-sm font-black uppercase tracking-wider text-[var(--background)]"
                >
                  I have saved my code — Continue
                </button>
              </div>
            </div>
          )}

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-bold text-[var(--cyan)]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function NeonField({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[var(--cyan)]">
        {label}
      </label>
      <input
        {...rest}
        className="input-neon mt-1.5 h-11 w-full px-4 text-sm text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}

function NeonSelect({ label, children, ...rest }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[var(--cyan)]">
        {label}
      </label>
      <select
        {...rest}
        className="input-neon mt-1.5 h-11 w-full px-4 text-sm text-foreground"
      >
        {children}
      </select>
    </div>
  );
}
