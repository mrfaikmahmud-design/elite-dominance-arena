import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Smartphone, Gamepad2, Cake, MapPin, Droplet, Compass, User2, Phone, Facebook, Globe, Trophy, Send, Pencil, Shield, Hourglass, ExternalLink, Loader2, KeyRound, Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfileHub,
});

type Profile = any;

function ProfileHub() {
  const { user } = useAuth();
  const [p, setP] = useState<Profile | null>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [reg, setReg] = useState<any>(null);
  const [postLink, setPostLink] = useState("");
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: prof }, { data: tour }] = await Promise.all([
      supabase.from("profiles").select("id,username,display_name,avatar_url,country,favorite_club,bio,rating,wins,losses,draws,tournaments_played,tournaments_won,fb_name,contact_number,fb_profile_link,dob,district,current_location,playing_device,konami_uid,blood_group,name_locked").eq("id", user.id).maybeSingle(),
      supabase
        .from("tournaments")
        .select("id,name,slug,starts_at")
        .in("status", ["registration_open", "upcoming", "registration_closed"])
        .order("starts_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    setP(prof);
    setTournament(tour);
    if (tour) {
      const { data: r } = await supabase
        .from("registrations")
        .select("*")
        .eq("tournament_id", tour.id)
        .eq("user_id", user.id)
        .maybeSingle();
      setReg(r);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!p) return <div className="glass animate-shimmer h-72 rounded-3xl" />;

  const handleRegister = async () => {
    if (!tournament) return;
    if (!postLink || !postLink.startsWith("http")) return toast.error("Paste a valid Facebook post link");
    setPending(true);
    const { error } = await supabase.from("registrations").insert({
      tournament_id: tournament.id,
      user_id: user!.id,
      fb_post_link: postLink,
      status: "pending",
    });
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("Registration submitted — pending admin approval");
    setPostLink("");
    load();
  };

  return (
    <div className="space-y-5">
      {/* PLAYER INFORMATION CARD */}
      <div className="neon-cyan relative overflow-hidden rounded-3xl bg-[var(--surface)]/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--cyan)]">Player Information</h2>
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-full border border-cyan/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--cyan)]"
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>
        {editing ? (
          <EditForm profile={p} onSaved={() => { setEditing(false); load(); }} />
        ) : (
          <div className="space-y-2.5">
            <InfoRow Icon={User2} label="FB Name" value={p.fb_name || p.display_name} />
            <InfoRow Icon={Phone} label="Contact" value={p.contact_number} />
            <InfoRow Icon={Facebook} label="FB Profile" value={p.fb_profile_link} link />
            <InfoRow Icon={Globe} label="Country" value={p.country} />
            <InfoRow Icon={Smartphone} label="Device Name" value={p.playing_device} />
            <InfoRow Icon={Gamepad2} label="Konami UID" value={p.konami_uid} />
            <InfoRow Icon={Cake} label="Birthday" value={p.dob} />
            <InfoRow Icon={MapPin} label="District" value={p.district} />
            <InfoRow Icon={Droplet} label="Blood Group" value={p.blood_group} />
            <InfoRow Icon={Compass} label="Location" value={p.current_location} />
          </div>
        )}
      </div>

      {/* RECOVERY CODE */}
      <RecoveryCard userId={p.id} />


      {/* TOURNAMENT REGISTRATION */}
      {tournament && (
        <div className="neon-gold relative overflow-hidden rounded-3xl bg-[var(--surface)]/70 p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[var(--gold)]" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--gold)]">Tournament Registration</div>
              <div className="font-display text-lg font-extrabold text-white">{tournament.name}</div>
            </div>
          </div>
          {reg ? (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--gold)]">
                {reg.status === "pending" && <><Hourglass className="h-4 w-4" /> Pending Approval</>}
                {reg.status === "approved" && <><Shield className="h-4 w-4" /> Approved ✓</>}
                {reg.status === "rejected" && <span className="text-red-400">Rejected</span>}
              </div>
              {reg.fb_post_link && (
                <a href={reg.fb_post_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--cyan)]">
                  Post <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ) : (
            <>
              <input
                value={postLink}
                onChange={(e) => setPostLink(e.target.value)}
                placeholder="Paste your post link (https://...)"
                className="input-neon mt-4 h-11 w-full px-4 text-sm"
              />
              <button
                onClick={handleRegister}
                disabled={pending}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--gradient-gold)] text-sm font-black uppercase tracking-wider text-[var(--gold-foreground)] shadow-[var(--shadow-glow-gold)] disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Register</>}
              </button>
            </>
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <Link
        to="/tournaments"
        className="flex items-center justify-center gap-2 rounded-2xl border border-cyan/40 bg-[var(--surface)]/60 py-3.5 text-sm font-bold uppercase tracking-wider text-[var(--cyan)]"
      >
        <Shield className="h-4 w-4" /> Full Web Access
      </Link>
      <button
        onClick={() => setEditing(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--gradient-cyan)] text-sm font-black uppercase tracking-wider text-[var(--background)] shadow-[var(--shadow-glow-cyan)]"
      >
        <Pencil className="h-4 w-4" /> Change Info
      </button>
    </div>
  );
}

function InfoRow({ Icon, label, value, link }: { Icon: any; label: string; value?: string | null; link?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-cyan/15 bg-[var(--surface-2)]/40 p-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan/30 bg-[var(--cyan)]/10 text-[var(--cyan)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">{label}</div>
        {value ? (
          link ? (
            <a href={value} target="_blank" rel="noreferrer" className="block truncate text-sm font-bold text-white">{value}</a>
          ) : (
            <div className="truncate text-sm font-bold text-white">{value}</div>
          )
        ) : (
          <div className="text-sm text-muted-foreground">—</div>
        )}
      </div>
    </div>
  );
}

function EditForm({ profile, onSaved }: { profile: any; onSaved: () => void }) {
  const [pending, setPending] = useState(false);
  const nameLocked = profile.name_locked !== false;
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setPending(true);
    const payload: any = {
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
    };
    // Only include name fields if unlocked (admin-only override)
    if (!nameLocked && fd.fb_name) {
      payload.fb_name = fd.fb_name;
      payload.display_name = fd.fb_name;
    }
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    onSaved();
  };
  const F = (label: string, name: string, type = "text", def = "", extra: any = {}) => (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cyan)]">{label}</label>
      <input {...extra} name={name} type={type} defaultValue={profile[def || name] ?? ""} className="input-neon mt-1 h-10 w-full px-3 text-sm" />
    </div>
  );
  return (
    <form onSubmit={save} className="space-y-3">
      <div>
        <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cyan)]">
          <span>FB Name {nameLocked && <Lock className="ml-1 inline h-3 w-3" />}</span>
          {nameLocked && <span className="text-[9px] text-muted-foreground">Locked — admin only</span>}
        </label>
        <input
          name="fb_name"
          defaultValue={profile.fb_name ?? profile.display_name ?? ""}
          disabled={nameLocked}
          className="input-neon mt-1 h-10 w-full px-3 text-sm disabled:opacity-60"
        />
      </div>
      {F("Contact", "contact_number", "text", "contact_number")}
      {F("FB Profile Link", "fb_profile_link", "url", "fb_profile_link")}
      {F("Country", "country", "text", "country")}
      {F("Date of Birth", "dob", "date", "dob")}
      {F("District", "district", "text", "district")}
      {F("Current Location", "current_location", "text", "current_location")}
      {F("Playing Device", "playing_device", "text", "playing_device")}
      {F("Konami UID", "konami_uid", "text", "konami_uid")}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cyan)]">Blood Group</label>
        <select name="blood_group" defaultValue={profile.blood_group ?? ""} className="input-neon mt-1 h-10 w-full px-3 text-sm">
          <option value="">Select</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (<option key={b}>{b}</option>))}
        </select>
      </div>
      {F("Avatar URL", "avatar_url", "url", "avatar_url")}
      <button
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-2xl bg-[var(--gradient-cyan)] text-sm font-black uppercase tracking-wider text-[var(--background)] shadow-[var(--shadow-glow-cyan)]"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
      </button>
    </form>
  );
}

function RecoveryCard({ userId }: { userId: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const reveal = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_recovery_code", { _user_id: userId });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!data) return toast.error("No recovery code on file");
    setCode(data as string);
    setVisible(true);
  };
  return (
    <div className="neon-gold relative overflow-hidden rounded-3xl bg-[var(--surface)]/70 p-5">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-[var(--gold)]" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--gold)]">Personal Recovery Code</div>
          <div className="font-display text-sm text-white">Share this only with the SDBD admin if you forget your password.</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--gold)]/40 bg-[var(--surface-2)] px-4 py-3 font-mono text-lg font-black tracking-[0.3em] text-[var(--gold)]">
        <span>{visible && code ? code : "•••• •••• ••"}</span>
        <button
          type="button"
          onClick={() => (visible ? setVisible(false) : reveal())}
          disabled={loading}
          className="rounded-md border border-[var(--gold)]/40 p-1.5 text-[var(--gold)]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
