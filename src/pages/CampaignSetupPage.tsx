import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CampaignSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { billboard, days } = (location.state as any) || {};
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Campaign Setup</h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 space-y-5">
        {/* Billboard Summary */}
        {billboard && (
          <div className="p-4 rounded-xl bg-secondary">
            <p className="text-xs text-muted-foreground">Selected Billboard</p>
            <p className="font-semibold text-foreground text-sm mt-1">{billboard.title}</p>
            <p className="text-xs text-muted-foreground">{billboard.city} · {days} days · ₹{(billboard.price * days).toLocaleString()}</p>
          </div>
        )}

        {/* Campaign Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Campaign Name</label>
          <Input
            placeholder="e.g. Summer Sale 2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Start Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Duration</label>
          <div className="p-3 rounded-xl bg-secondary">
            <span className="text-sm font-semibold text-foreground">{days || 7} days</span>
          </div>
        </div>

        <Button
          onClick={() => navigate("/upload-creative", { state: { billboard, days, name, startDate } })}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base mt-4"
          disabled={!name || !startDate}
        >
          Next: Upload Creative
        </Button>
      </motion.div>
    </div>
  );
};

export default CampaignSetupPage;
