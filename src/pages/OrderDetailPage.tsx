import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, MessageSquare, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, ORDER_TIMELINE, OrderStatus, isTerminal } from "@/lib/orderHelpers";
import { format } from "date-fns";
import { toast } from "sonner";

type OrderDetail = {
  id: string;
  listing_id: string;
  business_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  price_per_day: number;
  total_cost: number;
  status: OrderStatus;
  notes: string | null;
  rejection_reason: string | null;
  creative_url: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  listings: { title: string; city: string; area: string | null; images: string[] } | null;
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("orders")
      .select("*,listings(title,city,area,images)")
      .eq("id", id)
      .maybeSingle();
    setOrder(data as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const isOwner = user?.id === order?.owner_id;
  const isBusiness = user?.id === order?.business_id;

  const updateStatus = async (status: OrderStatus, extra: Record<string, any> = {}) => {
    if (!order) return;
    setActing(true);
    const { error } = await supabase.from("orders").update({ status, ...extra }).eq("id", order.id);
    setActing(false);
    if (error) return toast.error(error.message);
    toast.success(`Order ${status}`);
    load();
  };

  const openChat = async () => {
    if (!order || !user) return;
    // find or create conversation tied to this order
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("order_id", order.id)
      .maybeSingle();
    let convId = existing?.id;
    if (!convId) {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          listing_id: order.listing_id,
          order_id: order.id,
          business_id: order.business_id,
          owner_id: order.owner_id,
        })
        .select("id")
        .single();
      if (error) return toast.error(error.message);
      convId = data.id;
    }
    navigate(`/messages/${convId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }
  if (!order) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Order not found</div>;
  }

  const currentIdx = ORDER_TIMELINE.findIndex((t) => t.status === order.status);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-base font-semibold truncate">Order details</h1>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-4 space-y-4">
        {/* Listing */}
        <div className="flex gap-3 p-3 rounded-2xl bg-card border border-border">
          <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0">
            {order.listings?.images?.[0] && <img src={order.listings.images[0]} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{order.listings?.title}</p>
            <p className="text-xs text-muted-foreground">{order.listings?.area ? `${order.listings.area}, ` : ""}{order.listings?.city}</p>
            <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLOR[order.status]}`}>{ORDER_STATUS_LABEL[order.status]}</span>
          </div>
        </div>

        {/* Booking info */}
        <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dates</span><span className="font-medium">{format(new Date(order.start_date), "MMM d")} – {format(new Date(order.end_date), "MMM d, yyyy")}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="font-medium">{order.duration_days} days</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Rate</span><span className="font-medium">₹{order.price_per_day.toLocaleString()}/day</span></div>
          <div className="flex justify-between pt-2 border-t border-border"><span className="text-sm">Total</span><span className="font-bold text-lg">₹{order.total_cost.toLocaleString()}</span></div>
        </div>

        {order.notes && (
          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Notes from buyer</p>
            <p className="text-sm">{order.notes}</p>
          </div>
        )}

        {order.rejection_reason && (
          <div className="rounded-2xl bg-destructive/5 border border-destructive/30 p-4">
            <p className="text-xs text-destructive mb-1 font-medium">Rejection reason</p>
            <p className="text-sm">{order.rejection_reason}</p>
          </div>
        )}

        {/* Timeline */}
        {!isTerminal(order.status) || order.status === "completed" ? (
          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Progress</p>
            <div className="space-y-3">
              {ORDER_TIMELINE.map((t, i) => {
                const done = i <= currentIdx;
                const current = i === currentIdx;
                return (
                  <div key={t.status} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                      {done ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px]">{i + 1}</span>}
                    </div>
                    <span className={`text-sm ${current ? "font-semibold text-foreground" : done ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <Button variant="outline" className="w-full gap-2" onClick={openChat}>
          <MessageSquare className="w-4 h-4" /> Open chat
        </Button>
      </div>

      {/* Action footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-border">
        <div className="max-w-lg mx-auto flex gap-2">
          {isOwner && order.status === "pending" && (
            <>
              <Button variant="outline" className="flex-1" disabled={acting} onClick={() => {
                const reason = window.prompt("Reason for rejection (optional):") ?? "";
                updateStatus("rejected", { rejection_reason: reason || null });
              }}>Reject</Button>
              <Button className="flex-1" disabled={acting} onClick={() => updateStatus("approved", { approved_at: new Date().toISOString() })}>Approve</Button>
            </>
          )}
          {isBusiness && order.status === "approved" && (
            <Button className="w-full gap-2" disabled={acting} onClick={() => updateStatus("paid", { paid_at: new Date().toISOString() })}>
              <CreditCard className="w-4 h-4" /> Pay ₹{order.total_cost.toLocaleString()}
            </Button>
          )}
          {isOwner && order.status === "paid" && (
            <Button className="w-full" disabled={acting} onClick={() => updateStatus("printing")}>Start printing</Button>
          )}
          {isOwner && order.status === "printing" && (
            <Button className="w-full" disabled={acting} onClick={() => updateStatus("installed")}>Mark installed</Button>
          )}
          {isOwner && order.status === "installed" && (
            <Button className="w-full" disabled={acting} onClick={() => updateStatus("live")}>Mark live</Button>
          )}
          {isOwner && order.status === "live" && (
            <Button className="w-full" disabled={acting} onClick={() => updateStatus("completed")}>Mark completed</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
