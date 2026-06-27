import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { KeyRound, RefreshCw, Pencil, Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/players")({
  component: AdminPlayers,
});

const ROLES = ["player", "moderator", "admin", "super_admin"] as const;

function AdminPlayers() {
  const { isSuperAdmin, isAdmin } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = () =>
    supabase
      .from("profiles")
      .select("id,username,display_name,fb_name,rating,wins,losses,name_locked")
      .order("rating", { ascending: false })
      .limit(500)
      .then(async ({ data }) => {
        const ids = (data ?? []).map((p) => p.id);
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id,role")
          .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
        const map = new Map<string, string[]>();
        (roles ?? []).forEach((r) => {
          const arr = map.get(r.user_id) ?? [];
          arr.push(r.role);
          map.set(r.user_id, arr);
        });
        setList((data ?? []).map((p) => ({ ...p, roles: map.get(p.id) ?? [] })));
      });
  useEffect(() => { refresh(); }, []);

  const grant = async (uid: string, role: string) => {
    if (!isSuperAdmin) return toast.error("Only super admin can change roles");
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: role as any });
    if (error) toast.error(error.message);
    else { toast.success(`Granted ${role}`); refresh(); }
  };
  const revoke = async (uid: string, role: string) => {
    if (!isSuperAdmin) return toast.error("Only super admin can change roles");
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role as any);
    if (error) toast.error(error.message);
    else { toast.success(`Revoked ${role}`); refresh(); }
  };

  const viewCode = async (uid: string) => {
    if (codes[uid]) {
      setCodes((c) => { const n = { ...c }; delete n[uid]; return n; });
      return;
    }
    setBusy(uid);
    const { data, error } = await supabase.rpc("get_recovery_code", { _user_id: uid });
    setBusy(null);
    if (error) return toast.error(error.message);
    if (!data) return toast.error("No recovery code");
    setCodes((c) => ({ ...c, [uid]: data as string }));
  };

  const regenCode = async (uid: string) => {
    if (!confirm("Generate a new recovery code? The old one will stop working.")) return;
    setBusy(uid);
    const { data, error } = await supabase.rpc("regenerate_recovery_code", { _user_id: uid });
    setBusy(null);
    if (error) return toast.error(error.message);
    setCodes((c) => ({ ...c, [uid]: data as string }));
    toast.success("New recovery code generated");
  };

  const editName = async (uid: string, currentName: string) => {
    const next = window.prompt("New FB / display name:", currentName);
    if (!next || next.trim() === currentName) return;
    setBusy(uid);
    const { error } = await supabase.rpc("admin_update_player_name", { _user_id: uid, _fb_name: next.trim(), _display_name: next.trim(), _username: "" });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Name updated");
    refresh();
  };

  const filtered = list.filter(
    (p) =>
      p.username?.toLowerCase().includes(q.toLowerCase()) ||
      (p.display_name || "").toLowerCase().includes(q.toLowerCase()) ||
      (p.fb_name || "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold">Players, Roles & Recovery</h2>
      {!isAdmin && (
        <p className="mt-1 text-xs text-muted-foreground">Recovery codes & name overrides are admin-only.</p>
      )}
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or username..."
        className="mt-4 max-w-sm border-white/10 bg-white/5"
      />
      <ul className="mt-4 space-y-2">
        {filtered.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="font-semibold">
                {p.display_name || p.username}{" "}
                <span className="text-xs text-muted-foreground">@{p.username}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.roles.map((r: string) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--gold)]"
                  >
                    {r}
                    {isSuperAdmin && r !== "player" && (
                      <button onClick={() => revoke(p.id, r)} className="ml-1 text-destructive">×</button>
                    )}
                  </span>
                ))}
              </div>
              {isAdmin && codes[p.id] && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-[var(--gold)]/40 bg-[var(--surface-2)] px-2.5 py-1 font-mono text-xs font-black tracking-[0.2em] text-[var(--gold)]">
                  {codes[p.id]}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <>
                  <Button size="sm" variant="outline" onClick={() => viewCode(p.id)} disabled={busy === p.id}>
                    {busy === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : codes[p.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span className="ml-1">Code</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => regenCode(p.id)} disabled={busy === p.id}>
                    <RefreshCw className="h-3.5 w-3.5" /> <span className="ml-1">New</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editName(p.id, p.fb_name || p.display_name || "")} disabled={busy === p.id}>
                    <Pencil className="h-3.5 w-3.5" /> <span className="ml-1">Name</span>
                  </Button>
                </>
              )}
              {isSuperAdmin && (
                <>
                  <select
                    id={`role-${p.id}`}
                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-xs"
                    defaultValue="moderator"
                  >
                    {ROLES.filter((r) => !p.roles.includes(r)).map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => {
                      const sel = document.getElementById(`role-${p.id}`) as HTMLSelectElement;
                      if (sel?.value) grant(p.id, sel.value);
                    }}
                  >
                    Grant
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No players found.</p>}
      <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
        <KeyRound className="h-3.5 w-3.5 text-[var(--gold)]" />
        Recovery codes are private. Only the player and SDBD admins can see them.
      </div>
    </div>
  );
}
