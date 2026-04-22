import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Users, IndianRupee, TrendingUp, BarChart3, Calendar, MapPin, Radio, Plus, Power, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { computeBannerAnalytics, aggregateCampaignAnalytics } from "@/lib/analytics";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  live: "bg-success text-success-foreground",
  printing: "bg-warning text-warning-foreground",
  paused: "bg-muted text-muted-foreground",
  scheduled_off: "bg-destructive/10 text-destructive",
  ended: "bg-muted text-muted-foreground",
};

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    if (!id) return;
    const { data: c } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle();
    const { data: bs } = await supabase.from("campaign_billboards").select("*").eq("campaign_id", id).order("created_at");
    setCampaign(c);
    setBanners(bs ?? []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [id]);

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading…</div>;
  if (!campaign) return <div className="p-6 text-center text-muted-foreground">Campaign not found</div>;

  const bannerAnalytics = banners.map((b) =>
    computeBannerAnalytics({
      bannerId: b.id,
      pricePerDay: b.price_per_day,
      startDate: campaign.start_date,
      durationDays: campaign.duration_days,
      status: b.status,
    })
  );
  const agg = aggregateCampaignAnalytics(bannerAnalytics);

  const switchOffCampaign = async () => {
    const offAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    await supabase.from("campaigns").update({ status: "scheduled_off", scheduled_off_at: offAt }).eq("id", campaign.id);
    await supabase.from("campaign_billboards").update({ status: "scheduled_off", scheduled_off_at: offAt }).eq("campaign_id", campaign.id);
    toast.success("Campaign scheduled to be removed within 24-72 hours");
    loadAll();
  };

  const reactivate = async () => {
    await supabase.from("campaigns").update({ status: "live", scheduled_off_at: null }).eq("id", campaign.id);
    await supabase.from("campaign_billboards").update({ status: "live", scheduled_off_at: null }).eq("campaign_id", campaign.id);
    toast.success("Campaign reactivated");
    loadAll();
  };

  const progress = campaign.duration_days > 0 ? Math.round((agg.daysElapsed / campaign.duration_days) * 100) : 0;

  const metrics = [
    { icon: Eye, label: "Today's Impressions", value: agg.todayImpressions.toLocaleString(), color: "text-accent" },
    { icon: BarChart3, label: "Total Impressions", value: agg.totalImpressions.toLocaleString(), color: "text-accent" },
    { icon: TrendingUp, label: "Expected Total", value: agg.expectedTotal.toLocaleString(), color: "text-success" },
    { icon: IndianRupee, label: "Avg CAC", value: agg.cac > 0 ? `₹${agg.cac}` : "—", color: "text-warning" },
    { icon: Users, label: "Unique Reach", value: agg.reach.toLocaleString(), color: "text-accent" },
    { icon: BarChart3, label: "CTR", value: agg.ctr > 0 ? `${agg.ctr}%` : "—", color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{campaign.name}</h1>
          <p className="text-xs text-muted-foreground">{banners.length} {banners.length === 1 ? "banner" : "banners"} · ₹{campaign.total_cost.toLocaleString()}</p>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase ${statusColor[campaign.status]}`}>{campaign.status.replace("_", " ")}</span>
      </div>

      <div className="px-5 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-card card-shadow">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" /> Started {campaign.start_date} · {campaign.duration_days} days
          </div>
          {campaign.status === "live" && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-success font-medium">
              <Radio className="w-3 h-3 animate-pulse-dot" /> Broadcasting now
            </div>
          )}
          {campaign.status === "scheduled_off" && (
            <p className="mt-2 text-xs text-destructive">⚠ Removal scheduled within 24-72 hours</p>
          )}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Campaign progress</span><span>{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button onClick={() => navigate("/search", { state: { addToCampaign: campaign.id } })} variant="outline" className="flex-1 rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add banners
          </Button>
          {campaign.status === "scheduled_off" || campaign.status === "paused" ? (
            <Button onClick={reactivate} className="flex-1 rounded-xl gap-2 bg-success text-success-foreground">
              <Power className="w-4 h-4" /> Reactivate
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 rounded-xl gap-2 border-destructive text-destructive hover:bg-destructive/5">
                  <Power className="w-4 h-4" /> Switch off
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Switch off entire campaign?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All {banners.length} banner{banners.length > 1 ? "s" : ""} inside this campaign will be physically removed within <b>24-72 hours</b>. You will not be refunded for the remaining days. You can reactivate before removal.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep running</AlertDialogCancel>
                  <AlertDialogAction onClick={switchOffCampaign}>Yes, switch off</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Aggregate metrics */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-sm font-semibold text-foreground mb-3">Whole-Campaign Analytics</h2>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="p-3 rounded-xl bg-card card-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Per-banner list */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-semibold text-foreground mb-3">Banners in this campaign</h2>
          <div className="space-y-2">
            {banners.map((b, i) => {
              const a = bannerAnalytics[i];
              return (
                <button
                  key={b.id}
                  onClick={() => navigate(`/campaign/${campaign.id}/banner/${b.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card card-shadow text-left active:scale-[0.99] transition-transform"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">{b.billboard_title}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase ${statusColor[b.status]}`}>{b.status.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" /> {b.billboard_city}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1.5">
                      <span>👁 {a.totalImpressions.toLocaleString()}</span>
                      <span>₹{b.price_per_day.toLocaleString()}/day</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CampaignDetailPage;
