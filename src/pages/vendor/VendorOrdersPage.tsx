import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import VendorLayout from "@/components/vendor/VendorLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, OrderStatus } from "@/lib/orderHelpers";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Row = {
  id: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  total_cost: number;
  status: OrderStatus;
  created_at: string;
  listings: { title: string; city: string; images: string[] } | null;
};

const VendorOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,start_date,end_date,duration_days,total_cost,status,created_at,listings(title,city,images)")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const filter = (statuses: OrderStatus[]) => orders.filter((o) => statuses.includes(o.status));

  const renderList = (items: Row[]) => {
    if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />)}</div>;
    if (items.length === 0) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center bg-card">
          <Inbox className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No orders here yet</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {items.map((o) => (
          <button key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="w-full text-left flex gap-3 p-3 rounded-2xl bg-card border border-border hover:border-accent/40 transition-colors">
            <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
              {o.listings?.images?.[0] && <img src={o.listings.images[0]} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm truncate">{o.listings?.title ?? "Listing"}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${ORDER_STATUS_COLOR[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{o.listings?.city}</p>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[11px] text-muted-foreground">{format(new Date(o.start_date), "MMM d")} – {format(new Date(o.end_date), "MMM d")} · {o.duration_days}d</p>
                <p className="text-sm font-bold">₹{o.total_cost.toLocaleString()}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <VendorLayout>
      <h1 className="text-2xl md:text-3xl font-bold mb-1">Booking Requests</h1>
      <p className="text-sm text-muted-foreground mb-6">Review, approve, and track campaigns on your billboards</p>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending {filter(["pending"]).length > 0 && `(${filter(["pending"]).length})`}</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">{renderList(filter(["pending"]))}</TabsContent>
        <TabsContent value="active" className="mt-4">{renderList(filter(["approved", "paid", "printing", "installed", "live"]))}</TabsContent>
        <TabsContent value="all" className="mt-4">{renderList(orders)}</TabsContent>
      </Tabs>
    </VendorLayout>
  );
};

export default VendorOrdersPage;
