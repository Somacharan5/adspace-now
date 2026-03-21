import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Zap, IndianRupee, MapPin, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BillboardCard from "@/components/BillboardCard";
import BottomNav from "@/components/BottomNav";
import { billboards } from "@/lib/data";

const categories = [
  { icon: Zap, label: "High Traffic", color: "bg-accent/10 text-accent" },
  { icon: IndianRupee, label: "Budget Friendly", color: "bg-success/10 text-success" },
  { icon: Star, label: "Premium", color: "bg-warning/10 text-warning" },
  { icon: MapPin, label: "Near Me", color: "bg-destructive/10 text-destructive" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">Good morning 👋</p>
          <h1 className="text-xl font-bold text-foreground">Find your billboard</h1>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4">
          <div className="relative" onClick={() => navigate("/search")}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by city, area, landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-secondary border-0 text-sm"
              readOnly
            />
          </div>
        </motion.div>

        {/* Start Campaign CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Button
            onClick={() => navigate("/search")}
            className="w-full h-12 mt-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
          >
            Start Campaign
          </Button>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="px-5 mt-2">
        <h2 className="text-sm font-semibold text-foreground mb-3">Categories</h2>
        <div className="grid grid-cols-4 gap-2">
          {categories.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              onClick={() => navigate("/search")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card card-shadow"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-foreground text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Featured Billboards</h2>
          <button onClick={() => navigate("/search")} className="text-xs text-accent font-medium">See all</button>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none">
        {billboards.slice(0, 4).map((b) => (
          <BillboardCard key={b.id} billboard={b} />
        ))}
      </div>

      {/* Popular */}
      <div className="mt-6 px-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Popular in Mumbai</h2>
        <div className="space-y-3">
          {billboards.filter(b => b.city === "Mumbai" || b.city === "Delhi").map((b) => (
            <BillboardCard key={b.id} billboard={b} variant="list" />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
