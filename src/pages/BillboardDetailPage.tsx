import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Eye, Ruler, Zap, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { billboards } from "@/lib/data";
import billboard1 from "@/assets/billboard-1.jpg";
import billboard2 from "@/assets/billboard-2.jpg";
import billboard3 from "@/assets/billboard-3.jpg";
import billboard4 from "@/assets/billboard-4.jpg";

const imageMap: Record<string, string> = {
  "billboard-1": billboard1,
  "billboard-2": billboard2,
  "billboard-3": billboard3,
  "billboard-4": billboard4,
};

const BillboardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [days, setDays] = useState(7);

  const b = billboards.find((x) => x.id === id);
  if (!b) return <div className="p-6 text-center text-muted-foreground">Billboard not found</div>;

  const img = imageMap[b.image] || billboard1;
  const totalPrice = b.price * days;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero */}
      <div className="relative">
        <img src={img} alt={b.title} className="w-full h-64 object-cover" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 p-2 rounded-full glass"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-5">
        {/* Tags */}
        <div className="flex gap-2 mb-2">
          {b.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">{tag}</span>
          ))}
        </div>

        <h1 className="text-xl font-bold text-foreground">{b.title}</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="w-3.5 h-3.5" /> {b.location}, {b.city}
        </p>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: Ruler, label: "Size", value: b.size },
            { icon: Zap, label: "Type", value: b.type },
            { icon: Eye, label: "Reach", value: b.trafficEstimate },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-secondary text-center">
              <Icon className="w-4 h-4 mx-auto text-accent mb-1" />
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Map Placeholder */}
        <div className="mt-5 h-32 rounded-xl bg-secondary flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-6 h-6 mx-auto mb-1 opacity-40" />
            <p className="text-xs">Map preview</p>
          </div>
        </div>

        {/* Pricing Calculator */}
        <div className="mt-5 p-4 rounded-xl bg-card card-shadow-lg">
          <h3 className="font-semibold text-foreground text-sm">Pricing Calculator</h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-muted-foreground">Duration</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDays(Math.max(1, days - 1))}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-semibold text-foreground w-16 text-center">{days} days</span>
              <button
                onClick={() => setDays(days + 1)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">₹{totalPrice.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{days} days</p>
          </div>
          <Button
            onClick={() => navigate("/campaign-setup", { state: { billboard: b, days } })}
            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Select Billboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillboardDetailPage;
