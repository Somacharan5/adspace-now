import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Zap, IndianRupee, MapPin, Star, Sparkles, X } from "lucide-react";
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

const aiSuggestions = [
  "I want to promote my restaurant in Mumbai under ₹15,000/day",
  "Launch a tech product across Bangalore & Delhi",
  "Get maximum highway visibility on a budget",
];

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState<null | {
    summary: string;
    billboards: typeof billboards;
    totalCost: string;
  }>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAISuggest = (prompt: string) => {
    setAiLoading(true);
    setAiInput(prompt);
    // Simulate AI suggestion with matching logic
    setTimeout(() => {
      const lower = prompt.toLowerCase();
      let matched = billboards;

      if (lower.includes("mumbai")) matched = matched.filter((b) => b.city === "Mumbai");
      else if (lower.includes("bangalore")) matched = matched.filter((b) => b.city === "Bangalore");
      else if (lower.includes("delhi")) matched = matched.filter((b) => b.city === "Delhi" || b.city === "Noida");
      else if (lower.includes("highway")) matched = matched.filter((b) => b.tags.includes("Highway"));

      if (lower.includes("budget") || lower.includes("under")) {
        matched = matched.filter((b) => b.price <= 15000);
      }

      if (matched.length === 0) matched = billboards.slice(0, 3);
      matched = matched.slice(0, 3);

      const total = matched.reduce((s, b) => s + b.price * 7, 0);

      setAiResult({
        summary: `Based on your goal, I recommend ${matched.length} billboard${matched.length > 1 ? "s" : ""} for a 7-day campaign. These locations offer the best reach for your target audience.`,
        billboards: matched,
        totalCost: `₹${total.toLocaleString()} for 7 days`,
      });
      setAiLoading(false);
    }, 1500);
  };

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

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex gap-3 mt-4">
          <Button
            onClick={() => navigate("/search")}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
          >
            Start Campaign
          </Button>
          <Button
            onClick={() => setShowAI(true)}
            variant="outline"
            className="h-12 rounded-xl font-semibold text-base gap-2 border-accent text-accent hover:bg-accent/5"
          >
            <Sparkles className="w-4 h-4" /> AI Suggest
          </Button>
        </motion.div>
      </div>

      {/* AI Suggestion Modal */}
      {showAI && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-4 p-4 rounded-xl bg-card card-shadow-lg border border-accent/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">AI Campaign Planner</h3>
            </div>
            <button onClick={() => { setShowAI(false); setAiResult(null); setAiInput(""); }}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-3">Tell us what you want to achieve, and we'll suggest the best campaign.</p>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {aiSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleAISuggest(s)}
                className="text-[10px] px-3 py-1.5 rounded-full bg-accent/10 text-accent font-medium"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Promote my clothing brand in Hyderabad..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="h-10 rounded-xl bg-secondary border-0 text-sm flex-1"
            />
            <Button
              onClick={() => handleAISuggest(aiInput)}
              disabled={!aiInput.trim() || aiLoading}
              className="h-10 rounded-xl bg-accent text-accent-foreground font-semibold text-sm px-4"
            >
              {aiLoading ? "..." : "Go"}
            </Button>
          </div>

          {/* AI Results */}
          {aiLoading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Analyzing best options...
            </div>
          )}

          {aiResult && !aiLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <p className="text-xs text-foreground mb-3">{aiResult.summary}</p>
              <div className="space-y-2">
                {aiResult.billboards.map((rb) => (
                  <button
                    key={rb.id}
                    onClick={() => navigate(`/billboard/${rb.id}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{rb.title}</p>
                      <p className="text-xs text-muted-foreground">{rb.city} · ₹{rb.price.toLocaleString()}/day</p>
                    </div>
                    <span className="text-xs text-accent font-medium">View →</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl bg-accent/10 flex items-center justify-between">
                <span className="text-xs text-foreground font-medium">Estimated total</span>
                <span className="text-sm font-bold text-accent">{aiResult.totalCost}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

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
        {billboards.slice(0, 6).map((b) => (
          <BillboardCard key={b.id} billboard={b} />
        ))}
      </div>

      {/* Popular */}
      <div className="mt-6 px-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Popular in Mumbai</h2>
        <div className="space-y-3">
          {billboards.filter(b => b.city === "Mumbai").slice(0, 3).map((b) => (
            <BillboardCard key={b.id} billboard={b} variant="list" />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
