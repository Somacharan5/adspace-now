import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Calendar, MapPin, Eye, ChevronRight, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { seedDemoCampaignsIfEmpty } from "@/lib/seed";

type CampaignRow = {
  id: string;
  name: string;
  start_date: string;
  duration_days: number;
  status: string;
  total_cost: number;
  banners?: { count: number }[];
};

const statusColor: Record<string, string> = {
  live: "bg-success text-success-foreground",
  printing: "bg-warning text-warning-foreground",
  paused: "bg-muted text-muted-foreground",
  scheduled_off: "bg-destructive/10 text-destructive",
  ended: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
};

const CampaignsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await seedDemoCampaignsIfEmpty(user.id);
      const { data } = await supabase
        .from("campaigns")
        .select("id, name, start_date, duration_days, status, total_cost, banners:campaign_billboards(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setCampaigns(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your billboard campaigns</p>
        </div>
        <Button onClick={() => navigate("/search")} size="sm" className="rounded-xl gap-1"><Plus className="w-4 h-4" /> New</Button>
      </div>

      <div className="px-5 space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8 text-sm">Loading…</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No campaigns yet.</p>
            <Button onClick={() => navigate("/search")} className="mt-4 rounded-xl">Start your first campaign</Button>
          </div>
        ) : campaigns.map((c, i) => {
          const bannerCount = c.banners?.[0]?.count ?? 0;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/campaign/${c.id}`)}
              className="p-4 rounded-xl bg-card card-shadow cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{bannerCount} {bannerCount === 1 ? "banner" : "banners"} · ₹{c.total_cost.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase ${statusColor[c.status]}`}>
                    {c.status.replace("_", " ")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" /> {c.start_date}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" /> {c.duration_days}d
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {bannerCount} loc
                </div>
              </div>

              {c.status === "live" && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-success font-medium">
                  <Radio className="w-3 h-3 animate-pulse-dot" /> Broadcasting now
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default CampaignsPage;
