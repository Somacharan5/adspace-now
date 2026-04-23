import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Activity, IndianRupee, TrendingUp, Plus, Cloud, Printer, Briefcase, ShoppingBag, Users, Inbox, MessageSquare } from "lucide-react";
import VendorLayout from "@/components/vendor/VendorLayout";
import MetricCard from "@/components/vendor/MetricCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const VendorDashboardPage = () => {
  const { user, primaryRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ listings: 0, available: 0, booked: 0, revenue: 0 });
  const [orderStats, setOrderStats] = useState({ pending: 0, active: 0, unreadMessages: 0 });
  const [campaigns, setCampaigns] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      if (primaryRole === "property_owner") {
        const [{ data: listings }, { data: orders }, { data: convs }] = await Promise.all([
          supabase.from("listings").select("id,status,price_per_day").eq("owner_id", user.id),
          supabase.from("orders").select("id,status,total_cost").eq("owner_id", user.id),
          supabase.from("conversations").select("owner_unread_count").eq("owner_id", user.id),
        ]);
        const all = listings ?? [];
        const ords = orders ?? [];
        const activeOrders = ords.filter((o) => ["approved", "paid", "printing", "installed", "live"].includes(o.status));
        const completed = ords.filter((o) => o.status === "completed");
        setStats({
          listings: all.length,
          available: all.filter((l) => l.status === "available").length,
          booked: activeOrders.length,
          revenue: completed.reduce((s, o) => s + (o.total_cost ?? 0), 0) + activeOrders.reduce((s, o) => s + (o.total_cost ?? 0), 0),
        });
        setOrderStats({
          pending: ords.filter((o) => o.status === "pending").length,
          active: activeOrders.length,
          unreadMessages: (convs ?? []).reduce((s, c) => s + (c.owner_unread_count ?? 0), 0),
        });
      } else if (primaryRole === "agency") {
        const { count } = await supabase.from("campaigns").select("id", { count: "exact", head: true });
        setCampaigns(count ?? 0);
      }
      setLoading(false);
    })();
  }, [user, primaryRole]);

  if (loading) {
    return <VendorLayout><div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div></VendorLayout>;
  }

  if (primaryRole === "property_owner") {
    const occupancy = stats.listings ? Math.round((stats.booked / stats.listings) * 100) : 0;
    return (
      <VendorLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Property Owner Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your billboard inventory</p>
          </div>
          <Button onClick={() => navigate("/vendor/listings/new")} className="gap-2 rounded-xl"><Plus className="w-4 h-4" /> Add Listing</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard icon={Building2} label="Total Listings" value={stats.listings} accent="accent" />
          <MetricCard icon={Activity} label="Active Bookings" value={stats.booked} accent="success" />
          <MetricCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats.revenue / 1000).toFixed(0)}k`} accent="warning" />
          <MetricCard icon={TrendingUp} label="Occupancy Rate" value={`${occupancy}%`} hint={`${stats.booked} of ${stats.listings} booked`} accent="destructive" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button onClick={() => navigate("/vendor/orders")} className="text-left rounded-2xl border border-border bg-card p-5 hover:border-accent/40 transition-colors">
            <div className="flex items-center gap-2 mb-2"><Inbox className="w-4 h-4 text-warning" /><h3 className="font-semibold text-sm">Pending Requests</h3></div>
            <p className="text-3xl font-bold text-foreground">{orderStats.pending}</p>
            <p className="text-xs text-muted-foreground mt-1">{orderStats.pending > 0 ? "Awaiting your decision" : "All caught up"}</p>
          </button>
          <button onClick={() => navigate("/vendor/messages")} className="text-left rounded-2xl border border-border bg-card p-5 hover:border-accent/40 transition-colors">
            <div className="flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4 text-accent" /><h3 className="font-semibold text-sm">Unread Messages</h3></div>
            <p className="text-3xl font-bold text-foreground">{orderStats.unreadMessages}</p>
            <p className="text-xs text-muted-foreground mt-1">{orderStats.unreadMessages > 0 ? "From buyers and agencies" : "No new messages"}</p>
          </button>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2"><Cloud className="w-4 h-4 text-accent" /><h3 className="font-semibold text-sm">Weather Insights</h3></div>
            <p className="text-sm text-muted-foreground">Add a listing with location to see weather-based visibility forecasts.</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  if (primaryRole === "printing_vendor") {
    return (
      <VendorLayout>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Printing Vendor Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Manage your printing jobs</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard icon={Printer} label="Active Jobs" value={0} accent="accent" />
          <MetricCard icon={Inbox} label="Incoming Requests" value={0} accent="warning" />
          <MetricCard icon={Building2} label="Nearby Owners" value={0} accent="success" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 mt-6 text-center">
          <p className="text-sm text-muted-foreground">Job marketplace coming in Phase 2 — you'll receive printing requests from active campaigns.</p>
        </div>
      </VendorLayout>
    );
  }

  if (primaryRole === "agency") {
    return (
      <VendorLayout>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Agency Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Manage campaigns across clients</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard icon={Briefcase} label="Campaigns Managed" value={campaigns} accent="accent" />
          <MetricCard icon={Users} label="Clients" value={0} accent="success" />
          <MetricCard icon={Building2} label="Listings Used" value={0} accent="warning" />
        </div>
      </VendorLayout>
    );
  }

  // business fallback
  return (
    <VendorLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">Business Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Your campaigns at a glance</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Activity} label="Active Campaigns" value={0} accent="accent" />
        <MetricCard icon={ShoppingBag} label="Orders Placed" value={0} accent="success" />
        <MetricCard icon={Building2} label="Saved Listings" value={0} accent="warning" />
        <MetricCard icon={TrendingUp} label="Recommendations" value={0} accent="destructive" />
      </div>
    </VendorLayout>
  );
};

export default VendorDashboardPage;
