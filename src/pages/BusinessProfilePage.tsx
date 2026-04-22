import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const BusinessProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    business_name: "", industry: "", target_audience: "", marketing_goals: "",
    monthly_budget: "", description: "", preferred_cities: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("businesses").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({
        business_name: data.business_name ?? "",
        industry: data.industry ?? "",
        target_audience: data.target_audience ?? "",
        marketing_goals: data.marketing_goals ?? "",
        monthly_budget: data.monthly_budget?.toString() ?? "",
        description: data.description ?? "",
        preferred_cities: data.preferred_cities?.join(", ") ?? "",
      });
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const cities = form.preferred_cities.split(",").map((c) => c.trim()).filter(Boolean);
    const { error } = await supabase.from("businesses").upsert({
      user_id: user.id,
      business_name: form.business_name || null,
      industry: form.industry || null,
      target_audience: form.target_audience || null,
      marketing_goals: form.marketing_goals || null,
      monthly_budget: form.monthly_budget ? parseInt(form.monthly_budget) : null,
      description: form.description || null,
      preferred_cities: cities.length ? cities : null,
    }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Business profile saved");
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Business Profile</h1>
          <p className="text-xs text-muted-foreground">Helps our AI give you better recommendations</p>
        </div>
      </div>

      <div className="px-5 space-y-4">
        <div className="p-3 rounded-xl bg-accent/10 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">The more we know, the smarter your "Talk to Xads" recommendations become.</p>
        </div>

        <div className="space-y-2"><Label>Business name</Label><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} className="h-11 rounded-xl" placeholder="e.g. Sundara Restaurants" /></div>
        <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="h-11 rounded-xl" placeholder="e.g. Food & Beverage, SaaS, Real Estate" /></div>
        <div className="space-y-2"><Label>Target audience</Label><Input value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} className="h-11 rounded-xl" placeholder="e.g. Urban millennials, age 25-40" /></div>
        <div className="space-y-2"><Label>Marketing goals</Label><Textarea value={form.marketing_goals} onChange={(e) => setForm({ ...form, marketing_goals: e.target.value })} className="rounded-xl" placeholder="e.g. Increase brand awareness in metro cities, drive 20% footfall growth in 3 months" /></div>
        <div className="space-y-2"><Label>Monthly marketing budget (₹)</Label><Input type="number" value={form.monthly_budget} onChange={(e) => setForm({ ...form, monthly_budget: e.target.value })} className="h-11 rounded-xl" placeholder="e.g. 500000" /></div>
        <div className="space-y-2"><Label>Preferred cities (comma-separated)</Label><Input value={form.preferred_cities} onChange={(e) => setForm({ ...form, preferred_cities: e.target.value })} className="h-11 rounded-xl" placeholder="e.g. Bangalore, Mumbai, Delhi" /></div>
        <div className="space-y-2"><Label>About your business</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" placeholder="A few lines about what you do, your USP, current challenges…" rows={4} /></div>

        <Button onClick={save} disabled={saving} className="w-full rounded-xl gap-2"><Save className="w-4 h-4" /> Save business profile</Button>
      </div>
    </div>
  );
};

export default BusinessProfilePage;
