import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import VendorLayout from "@/components/vendor/VendorLayout";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const NotificationsPage = ({ vendorMode = false }: { vendorMode?: boolean }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (mounted) { setItems((data as any) ?? []); setLoading(false); }
    };
    load();
    const channel = supabase
      .channel(`notif-page-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [user]);

  const markAll = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    setItems((p) => p.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };

  const open = async (n: Notif) => {
    if (!n.read_at) {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
    }
    if (n.link) navigate(n.link);
  };

  const list = (
    <div className="space-y-2">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />)
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center mt-4">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : items.map((n) => (
        <button key={n.id} onClick={() => open(n)} className={`w-full text-left p-3 rounded-2xl border border-border hover:border-accent/40 transition-colors ${n.read_at ? "bg-card" : "bg-accent/5"}`}>
          <div className="flex items-start gap-2">
            {!n.read_at && <span className="w-2 h-2 mt-1.5 rounded-full bg-accent shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{n.title}</p>
              {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  if (vendorMode) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">All booking updates and messages</p>
          </div>
          {items.some((n) => !n.read_at) && (
            <Button variant="outline" onClick={markAll} className="gap-2"><Check className="w-4 h-4" /> Mark all read</Button>
          )}
        </div>
        {list}
      </VendorLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold flex-1">Notifications</h1>
        {items.some((n) => !n.read_at) && (
          <Button variant="ghost" size="sm" onClick={markAll} className="gap-1 text-xs"><Check className="w-3.5 h-3.5" /> Mark all read</Button>
        )}
      </div>
      <div className="max-w-lg mx-auto px-5 pt-4">{list}</div>
      <BottomNav />
    </div>
  );
};

export default NotificationsPage;
