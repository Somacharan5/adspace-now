import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Users, CloudSun, IndianRupee, TrendingUp, BarChart3, Calendar, MapPin, Radio } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const campaignsData = [
  {
    id: "XH-A1B2C3",
    name: "Summer Sale 2025",
    billboard: "MG Road Premium Hoarding",
    city: "Bangalore",
    status: "Live",
    startDate: "2025-03-15",
    totalDays: 30,
    daysElapsed: 6,
    todayImpressions: "8,420",
    totalImpressions: "45,200",
    expectedTotalImpressions: "2,40,000",
    cac: "₹12.50",
    ctr: "2.8%",
    reach: "38,500",
    frequency: "1.17",
    weather: [
      { date: "2025-03-20", condition: "Sunny", temp: "32°C", icon: "☀️" },
      { date: "2025-03-19", condition: "Partly Cloudy", temp: "30°C", icon: "⛅" },
      { date: "2025-03-18", condition: "Sunny", temp: "33°C", icon: "☀️" },
      { date: "2025-03-17", condition: "Rainy", temp: "26°C", icon: "🌧️" },
      { date: "2025-03-16", condition: "Cloudy", temp: "28°C", icon: "☁️" },
      { date: "2025-03-15", condition: "Sunny", temp: "31°C", icon: "☀️" },
    ],
  },
  {
    id: "XH-D4E5F6",
    name: "Product Launch",
    billboard: "Andheri Digital Billboard",
    city: "Mumbai",
    status: "Printing",
    startDate: "2025-04-01",
    totalDays: 14,
    daysElapsed: 0,
    todayImpressions: "-",
    totalImpressions: "-",
    expectedTotalImpressions: "3,50,000",
    cac: "-",
    ctr: "-",
    reach: "-",
    frequency: "-",
    weather: [
      { date: "2025-03-20", condition: "Humid", temp: "34°C", icon: "🌤️" },
      { date: "2025-03-19", condition: "Sunny", temp: "33°C", icon: "☀️" },
      { date: "2025-03-18", condition: "Rainy", temp: "28°C", icon: "🌧️" },
    ],
  },
];

const statusColor: Record<string, string> = {
  Live: "bg-success text-success-foreground",
  Printing: "bg-warning text-warning-foreground",
  Completed: "bg-muted text-muted-foreground",
};

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const campaign = campaignsData.find((c) => c.id === id);
  if (!campaign) return <div className="p-6 text-center text-muted-foreground">Campaign not found</div>;

  const metrics = [
    { icon: Eye, label: "Today's Impressions", value: campaign.todayImpressions, color: "text-accent" },
    { icon: BarChart3, label: "Total Impressions", value: campaign.totalImpressions, color: "text-accent" },
    { icon: TrendingUp, label: "Expected Total", value: campaign.expectedTotalImpressions, color: "text-success" },
    { icon: IndianRupee, label: "CAC", value: campaign.cac, color: "text-warning" },
    { icon: Users, label: "Unique Reach", value: campaign.reach, color: "text-accent" },
    { icon: BarChart3, label: "CTR", value: campaign.ctr, color: "text-success" },
    { icon: TrendingUp, label: "Frequency", value: campaign.frequency, color: "text-warning" },
  ];

  const progress = campaign.totalDays > 0 ? Math.round((campaign.daysElapsed / campaign.totalDays) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{campaign.name}</h1>
          <p className="text-xs text-muted-foreground">{campaign.id}</p>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColor[campaign.status] || statusColor.Completed}`}>
          {campaign.status}
        </span>
      </div>

      <div className="px-5 space-y-4">
        {/* Campaign Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-card card-shadow">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" /> {campaign.billboard}, {campaign.city}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="w-3.5 h-3.5" /> Started {campaign.startDate} · {campaign.totalDays} days
          </div>
          {campaign.status === "Live" && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-success font-medium">
              <Radio className="w-3 h-3 animate-pulse-dot" /> Broadcasting now
            </div>
          )}
          {/* Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Campaign progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-sm font-semibold text-foreground mb-3">Campaign Metrics</h2>
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

        {/* Weather */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            <CloudSun className="w-4 h-4 inline mr-1.5" />
            Weather at Location
          </h2>
          <div className="p-4 rounded-xl bg-card card-shadow">
            {/* Today highlight */}
            {campaign.weather[0] && (
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Today</p>
                  <p className="text-sm font-semibold text-foreground">{campaign.weather[0].condition}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{campaign.weather[0].icon}</span>
                  <span className="text-lg font-bold text-foreground">{campaign.weather[0].temp}</span>
                </div>
              </div>
            )}
            {/* Weather log */}
            <div className="space-y-2">
              {campaign.weather.slice(1).map((w) => (
                <div key={w.date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">{w.date}</span>
                  <div className="flex items-center gap-2">
                    <span>{w.icon}</span>
                    <span className="text-foreground font-medium text-xs">{w.temp}</span>
                    <span className="text-muted-foreground text-xs">{w.condition}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Estimated Daily Breakdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-sm font-semibold text-foreground mb-3">Daily Performance</h2>
          <div className="p-4 rounded-xl bg-card card-shadow space-y-2">
            {[
              { day: "Day 6 (Today)", impressions: "8,420", status: "🟢" },
              { day: "Day 5", impressions: "9,100", status: "🟢" },
              { day: "Day 4", impressions: "7,850", status: "🟡" },
              { day: "Day 3", impressions: "6,200", status: "🟡" },
              { day: "Day 2", impressions: "8,030", status: "🟢" },
              { day: "Day 1", impressions: "5,600", status: "🟡" },
            ].map((d) => (
              <div key={d.day} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-xs">{d.status} {d.day}</span>
                <span className="text-foreground font-medium text-xs">{d.impressions} impressions</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CampaignDetailPage;
