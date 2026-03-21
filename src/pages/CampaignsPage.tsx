import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Calendar, MapPin, Eye, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const campaigns = [
  {
    id: "XH-A1B2C3",
    name: "Summer Sale 2025",
    billboard: "MG Road Premium Hoarding",
    city: "Bangalore",
    status: "Live",
    startDate: "2025-03-15",
    impressions: "45,200",
  },
  {
    id: "XH-D4E5F6",
    name: "Product Launch",
    billboard: "Andheri Digital Billboard",
    city: "Mumbai",
    status: "Printing",
    startDate: "2025-04-01",
    impressions: "-",
  },
];

const statusColor: Record<string, string> = {
  Live: "bg-success text-success-foreground",
  Printing: "bg-warning text-warning-foreground",
  Completed: "bg-muted text-muted-foreground",
};

const CampaignsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-xl font-bold text-foreground">My Campaigns</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage your billboard campaigns</p>
      </div>

      <div className="px-5 space-y-4">
        {campaigns.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(`/campaign/${c.id}`)}
            className="p-4 rounded-xl bg-card card-shadow cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-sm">{c.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{c.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColor[c.status] || statusColor.Completed}`}>
                  {c.status}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" /> {c.city}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" /> {c.startDate}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" /> {c.impressions}
              </div>
            </div>

            {c.status === "Live" && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-success font-medium">
                <Radio className="w-3 h-3 animate-pulse-dot" /> Broadcasting now
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default CampaignsPage;
