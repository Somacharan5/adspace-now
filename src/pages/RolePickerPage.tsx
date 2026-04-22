import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Printer, Briefcase, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ROLES: { value: AppRole; label: string; desc: string; icon: any; color: string }[] = [
  { value: "business", label: "Business / Advertiser", desc: "Book billboards to promote your brand", icon: ShoppingBag, color: "from-accent/20 to-accent/5" },
  { value: "property_owner", label: "Property Owner", desc: "List your billboard inventory & earn", icon: Building2, color: "from-success/20 to-success/5" },
  { value: "printing_vendor", label: "Printing Vendor", desc: "Get printing jobs from campaigns", icon: Printer, color: "from-warning/20 to-warning/5" },
  { value: "agency", label: "Agency", desc: "Run campaigns for multiple clients", icon: Briefcase, color: "from-destructive/20 to-destructive/5" },
];

const RolePickerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshRole } = useAuth();
  const [selected, setSelected] = useState<AppRole | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user || !selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_role_selections")
      .upsert({ user_id: user.id, primary_role: selected }, { onConflict: "user_id" });
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    await refreshRole();
    toast.success("Welcome to Xads!");
    const target = selected === "business" ? "/home" : "/vendor/dashboard";
    navigate((location.state as any)?.from ?? target, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">How will you use Xads?</h1>
          <p className="text-muted-foreground mt-2">Pick the role that fits you best — you can change this later.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROLES.map(({ value, label, desc, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all bg-gradient-to-br ${color} ${
                selected === value ? "border-accent shadow-lg scale-[1.02]" : "border-border hover:border-accent/40"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-background/80 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">{label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </button>
          ))}
        </div>

        <Button
          onClick={save}
          disabled={!selected || saving}
          className="w-full h-12 rounded-xl mt-8 bg-primary text-primary-foreground font-semibold gap-2"
        >
          {saving ? "Saving..." : "Continue"} <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};

export default RolePickerPage;
