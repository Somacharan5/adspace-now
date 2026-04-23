import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Eye, Ruler, Zap, Minus, Plus, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { billboards, billboardReviews } from "@/lib/data";
import BillboardCard from "@/components/BillboardCard";
import RequestBookingDialog from "@/components/RequestBookingDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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

type DbListing = { id: string; owner_id: string | null; price_per_day: number; title: string };

const BillboardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [days, setDays] = useState(7);
  const [dbListing, setDbListing] = useState<DbListing | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const b = billboards.find((x) => x.id === id);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select("id,owner_id,price_per_day,title")
        .eq("legacy_id", id)
        .maybeSingle();
      if (data) setDbListing(data as DbListing);
    })();
  }, [id]);

  if (!b) return <div className="p-6 text-center text-muted-foreground">Billboard not found</div>;

  const img = imageMap[b.image] || billboard1;
  const totalPrice = b.price * days;
  const reviews = billboardReviews.filter((r) => r.billboardId === b.id);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const related = billboards
    .filter((x) => x.id !== b.id && (x.city === b.city || x.tags.some((t) => b.tags.includes(t))))
    .slice(0, 4);

  const startChat = async () => {
    if (!user || !dbListing?.owner_id) return toast.error("Chat unavailable for this listing");
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", dbListing.id)
      .eq("business_id", user.id)
      .is("order_id", null)
      .maybeSingle();
    let convId = existing?.id;
    if (!convId) {
      const { data, error } = await supabase
        .from("conversations")
        .insert({ listing_id: dbListing.id, business_id: user.id, owner_id: dbListing.owner_id })
        .select("id")
        .single();
      if (error) return toast.error(error.message);
      convId = data.id;
    }
    navigate(`/messages/${convId}`);
  };

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
        <div className="flex gap-2 mb-2">
          {b.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">{tag}</span>
          ))}
        </div>

        <h1 className="text-xl font-bold text-foreground">{b.title}</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="w-3.5 h-3.5" /> {b.location}, {b.city}
        </p>

        {avgRating && (
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <span className="text-sm font-semibold text-foreground">{avgRating}</span>
            <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        )}

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

        <div className="mt-5 h-32 rounded-xl bg-secondary flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-6 h-6 mx-auto mb-1 opacity-40" />
            <p className="text-xs">Map preview</p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-card card-shadow-lg">
          <h3 className="font-semibold text-foreground text-sm">Pricing Calculator</h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-muted-foreground">Duration</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setDays(Math.max(1, days - 1))} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Minus className="w-3 h-3" /></button>
              <span className="font-semibold text-foreground w-16 text-center">{days} days</span>
              <button onClick={() => setDays(days + 1)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-foreground text-sm mb-3">Reviews ({reviews.length})</h3>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-card card-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{r.user}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 text-warning fill-warning" />)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{r.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-foreground text-sm mb-3">You might also like</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-5 px-5">
              {related.map((rb) => <BillboardCard key={rb.id} billboard={rb} />)}
            </div>
          </div>
        )}
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-border">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <div className="flex-1">
            <p className="text-lg font-bold text-foreground">₹{totalPrice.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{days} days</p>
          </div>
          {dbListing && (
            <Button variant="outline" size="icon" onClick={startChat} className="h-11 w-11 rounded-xl shrink-0" aria-label="Message owner">
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={() => dbListing ? setBookingOpen(true) : navigate("/campaign-setup", { state: { billboard: b, days } })}
            className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            {dbListing ? "Request Booking" : "Select Billboard"}
          </Button>
        </div>
      </div>

      {dbListing && (
        <RequestBookingDialog open={bookingOpen} onOpenChange={setBookingOpen} listing={dbListing} />
      )}
    </div>
  );
};

export default BillboardDetailPage;
