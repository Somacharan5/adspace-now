import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, OrderStatus } from "@/lib/orderHelpers";
import { format } from "date-fns";

type OrderRow = {
  id: string;
  listing_id: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  total_cost: number;
  status: OrderStatus;
  created_at: string;
  listings: { title: string; city: string; images: string[] } | null;
};

const OrdersListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,listing_id,start_date,end_date,duration_days,total_cost,status,created_at,listings(title,city,images)")
        .eq("business_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center mt-8">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No orders yet. Browse the marketplace to request a booking.</p>
          </div>
        ) : (
          orders.map((o) => (
            <button
              key={o.id}
              onClick={() => navigate(`/orders/${o.id}`)}
              className="w-full text-left flex gap-3 p-3 rounded-2xl bg-card border border-border hover:border-accent/40 transition-colors"
            >
              <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                {o.listings?.images?.[0] && <img src={o.listings.images[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-foreground truncate">{o.listings?.title ?? "Listing"}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${ORDER_STATUS_COLOR[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{o.listings?.city}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[11px] text-muted-foreground">{format(new Date(o.start_date), "MMM d")} – {format(new Date(o.end_date), "MMM d")} · {o.duration_days}d</p>
                  <p className="text-sm font-bold text-foreground">₹{o.total_cost.toLocaleString()}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default OrdersListPage;
