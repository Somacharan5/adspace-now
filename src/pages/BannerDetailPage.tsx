import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Users, IndianRupee, TrendingUp, BarChart3, MapPin, Radio, Power, CloudSun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { computeBannerAnalytics } from "@/lib/analytics";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  live: "bg-success text-success-foreground",
  printing: "bg-warning text-warning-foreground",
  scheduled_off: "bg-destructive/10 text-destructive",
  off: "bg-muted text-muted-foreground",
};

const BannerDetailPage = () => {
  const { id, bannerId } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!bannerId) return;
    const { data: b } = await supabase.from("campaign_billboards").select("*").eq("id", bannerId).maybeSingle();
    const { data: c } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle();
    setBanner(b);
    setCampaign(c);
    setLoading(false);

    if (b?.billboard_lat && b?.billboard_lng) {
      try {
        const { data, error } = await supabase.functions.invoke("get-weather", {
          body: { lat: b.billboard_lat, lng: b.billboard_lng, city: b.billboard_city },
        });
        if (!error) setWeather(data);
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => { load(); }, [bannerId]);

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading…</div>;
  if (!banner || !campaign) return <div className="p-6 text-center text-muted-foreground">Banner not found</div>;

  const a = computeBannerAnalytics({
    bannerId: banner.id,
    pricePerDay: banner.price_per_day,
    startDate: campaign.start_date,
    durationDays: campaign.duration_days,
    status: banner.status,
  });

  const switchOff = async () => {
    const offAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("campaign_billboards").update({ status: "scheduled_off", scheduled_off_at: offAt }).eq("id", banner.id);
    toast.success("Banner scheduled to be removed within 24 hours");
    load();
  };

  const reactivate = async () => {
    await supabase.from("campaign_billboards").update({ status: "live", scheduled_off_at: null }).eq("id", banner.id);
    toast.success("Banner reactivated");
    load();
  };

  const metrics = [
    { icon: Eye, label: "Today's Impressions", value: a.todayImpressions.toLocaleString(), color: "text-accent" },
    { icon: BarChart3, label: "Total Impressions", value: a.totalImpressions.toLocaleString(), color: "text-accent" },
    { icon: TrendingUp, label: "Expected Total", value: a.expectedTotal.toLocaleString(), color: "text-success" },
    { icon: IndianRupee, label: "CAC", value: a.cac > 0 ? `₹${a.cac}` : "—", color: "text-warning" },
    { icon: Users, label: "Reach", value: a.reach.toLocaleString(), color: "text-accent" },
    { icon: BarChart3, label: "CTR", value: a.ctr > 0 ? `${a.ctr}%` : "—", color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{banner.billboard_title}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {banner.billboard_location}, {banner.billboard_city}</p>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase ${statusColor[banner.status]}`}>{banner.status.replace("_", " ")}</span>
      </div>

      <div className="px-5 space-y-4">
        {banner.status === "live" && (
          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
            <Radio className="w-3 h-3 animate-pulse-dot" /> This banner is currently broadcasting
          </div>
        )}
        {banner.status === "scheduled_off" && (
          <p className="text-xs text-destructive">⚠ This banner will be removed within 24 hours</p>
        )}

        {/* Per-banner action */}
        <div>
          {banner.status === "scheduled_off" || banner.status === "off" ? (
            <Button onClick={reactivate} className="w-full rounded-xl gap-2 bg-success text-success-foreground">
              <Power className="w-4 h-4" /> Reactivate this banner
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full rounded-xl gap-2 border-destructive text-destructive hover:bg-destructive/5">
                  <Power className="w-4 h-4" /> Switch off this banner
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Switch off this banner?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your banner at <b>{banner.billboard_title}</b> will be physically removed within <b>24 hours</b>. The rest of your campaign will continue running.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it live</AlertDialogCancel>
                  <AlertDialogAction onClick={switchOff}>Yes, switch off</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Banner analytics */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-sm font-semibold text-foreground mb-3">Banner Analytics</h2>
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

        {/* Live weather */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <CloudSun className="w-4 h-4" /> Realtime Weather at Location
          </h2>
          <div className="p-4 rounded-xl bg-card card-shadow">
            {!weather ? (
              <p className="text-xs text-muted-foreground text-center py-4">Loading weather…</p>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Now in {banner.billboard_city}</p>
                    <p className="text-sm font-semibold text-foreground">{weather.today.condition}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Humidity {weather.today.humidity} · Wind {weather.today.wind}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{weather.today.icon}</span>
                    <span className="text-xl font-bold text-foreground">{weather.today.temp}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide mb-2">Past 7 days</p>
                  {weather.log.map((w: any) => (
                    <div key={w.date} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-xs">{w.date}</span>
                      <div className="flex items-center gap-2">
                        <span>{w.icon}</span>
                        <span className="text-foreground font-medium text-xs">{w.temp}</span>
                        <span className="text-muted-foreground text-xs hidden sm:inline">{w.condition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Daily performance */}
        {a.daily.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-sm font-semibold text-foreground mb-3">Daily Performance</h2>
            <div className="p-4 rounded-xl bg-card card-shadow space-y-2">
              {a.daily.slice().reverse().map((d) => (
                <div key={d.day} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">Day {d.day}</span>
                  <span className="text-foreground font-medium text-xs">{d.impressions.toLocaleString()} impressions</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BannerDetailPage;
