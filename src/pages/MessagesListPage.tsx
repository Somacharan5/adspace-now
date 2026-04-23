import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import VendorLayout from "@/components/vendor/VendorLayout";
import { formatDistanceToNow } from "date-fns";

type Conv = {
  id: string;
  business_id: string;
  owner_id: string;
  last_message_at: string;
  last_message_preview: string | null;
  business_unread_count: number;
  owner_unread_count: number;
  listings: { title: string; images: string[] } | null;
};

type Props = { vendorMode?: boolean };

const MessagesListPage = ({ vendorMode = false }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("id,business_id,owner_id,last_message_at,last_message_preview,business_unread_count,owner_unread_count,listings(title,images)")
        .or(`business_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
      if (mounted) {
        setConvs((data as any) ?? []);
        setLoading(false);
      }
    };
    load();
    const channel = supabase
      .channel(`convs-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, load)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [user]);

  const list = (
    <div className="space-y-2">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />)
      ) : convs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center mt-4">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No conversations yet. Chats appear here when you message a {vendorMode ? "buyer" : "listing owner"}.</p>
        </div>
      ) : (
        convs.map((c) => {
          const unread = user?.id === c.business_id ? c.business_unread_count : c.owner_unread_count;
          return (
            <button key={c.id} onClick={() => navigate(`/messages/${c.id}`)} className="w-full text-left flex gap-3 p-3 rounded-2xl bg-card border border-border hover:border-accent/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                {c.listings?.images?.[0] && <img src={c.listings.images[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-sm truncate">{c.listings?.title ?? "Conversation"}</p>
                  <p className="text-[10px] text-muted-foreground shrink-0">{formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}</p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">{c.last_message_preview ?? "No messages yet"}</p>
                  {unread > 0 && <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">{unread}</span>}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );

  if (vendorMode) {
    return (
      <VendorLayout>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Messages</h1>
        <p className="text-sm text-muted-foreground mb-6">Chat with businesses booking your listings</p>
        {list}
      </VendorLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">Messages</h1>
      </div>
      <div className="max-w-lg mx-auto px-5 pt-4">{list}</div>
      <BottomNav />
    </div>
  );
};

export default MessagesListPage;
