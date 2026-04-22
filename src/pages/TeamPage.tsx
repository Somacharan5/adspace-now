import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Mail, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TeamPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<"viewer" | "commenter" | "editor" | "payer">("viewer");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("team_members").select("*").eq("owner_id", user.id).order("created_at");
    setMembers(data ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const invite = async () => {
    if (!user || !contact) return;
    const isEmail = contact.includes("@");
    const payload: any = { owner_id: user.id, role };
    if (isEmail) payload.invited_email = contact.trim();
    else payload.invited_phone = contact.trim();
    const { error } = await supabase.from("team_members").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(`Invitation sent to ${contact}`);
    setContact("");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("team_members").delete().eq("id", id);
    load();
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Team</h1>
          <p className="text-xs text-muted-foreground">Invite teammates to view, comment, edit and pay</p>
        </div>
      </div>

      <div className="px-5 space-y-5">
        <div className="p-4 rounded-xl bg-card card-shadow space-y-3">
          <div className="space-y-2"><Label>Email or phone</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} className="h-11 rounded-xl" placeholder="teammate@company.com or +91…" /></div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer — can only view</SelectItem>
                <SelectItem value="commenter">Commenter — view & comment</SelectItem>
                <SelectItem value="editor">Editor — manage campaigns</SelectItem>
                <SelectItem value="payer">Payer — can make payments</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={invite} disabled={!contact} className="w-full rounded-xl gap-2"><Plus className="w-4 h-4" /> Send invite</Button>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Invited members</h2>
          {members.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No teammates yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-card card-shadow">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    {m.invited_email ? <Mail className="w-4 h-4 text-muted-foreground" /> : <Phone className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.invited_email ?? m.invited_phone}</p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">{m.role} · {m.status}</p>
                  </div>
                  <button onClick={() => remove(m.id)} className="p-2 text-destructive hover:bg-destructive/5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
