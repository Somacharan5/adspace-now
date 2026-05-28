import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Mail, Lock, User as UserIcon, Building2, Printer, Briefcase, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/xads-logo.png";
import type { AppRole } from "@/contexts/AuthContext";

type Mode = "signin" | "signup";
type Flow = "business" | "vendor-pick" | "vendor-form";

const VENDOR_ROLES: { value: AppRole; label: string; desc: string; icon: any }[] = [
  { value: "property_owner", label: "Property Owner", desc: "List your billboards & earn", icon: Building2 },
  { value: "printing_vendor", label: "Printing Vendor", desc: "Receive printing jobs", icon: Printer },
  { value: "agency", label: "Agency", desc: "Run campaigns for clients", icon: Briefcase },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [flow, setFlow] = useState<Flow>("business");
  const [vendorRole, setVendorRole] = useState<AppRole | null>(null);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const assignRole = async (userId: string, role: AppRole) => {
    await supabase
      .from("user_role_selections")
      .upsert({ user_id: userId, primary_role: role }, { onConflict: "user_id" });
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const intendedRole: AppRole = flow === "vendor-form" && vendorRole ? vendorRole : "business";
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (data.user) await assignRole(data.user.id, intendedRole);
        toast.success("Account created!");
        navigate(intendedRole === "business" ? "/home" : "/vendor/dashboard");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // If signing in via vendor flow, ensure their role matches
        if (flow === "vendor-form" && vendorRole && data.user) {
          await assignRole(data.user.id, vendorRole);
        }
        navigate(intendedRole === "business" ? "/home" : "/vendor/dashboard");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const callbackUrl = isVendor ? `${window.location.origin}/vendor/dashboard` : `${window.location.origin}/home`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (error) {
        toast.error("Google sign-in failed. Try email instead.");
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      toast.error("Google sign-in could not start.");
      setLoading(false);
    } catch (e: any) {
      toast.error(e.message ?? "Google sign-in failed");
      setLoading(false);
    }
  };

  // Vendor role picker step
  if (flow === "vendor-pick") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <button onClick={() => setFlow("business")} className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex justify-center mb-8"><img src={logo} alt="Xads" className="h-10" /></div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Login as Vendor</h1>
          <p className="text-sm text-muted-foreground mb-6">What kind of vendor are you?</p>
          <div className="space-y-3">
            {VENDOR_ROLES.map(({ value, label, desc, icon: Icon }) => (
              <button
                key={value}
                onClick={() => { setVendorRole(value); setFlow("vendor-form"); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-accent transition-all text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{label}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const isVendor = flow === "vendor-form";
  const vendorLabel = VENDOR_ROLES.find((r) => r.value === vendorRole)?.label;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        {isVendor && (
          <button onClick={() => setFlow("vendor-pick")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <ChevronLeft className="w-4 h-4" /> Change role
          </button>
        )}
        <div className="flex justify-center mb-10">
          <img src={logo} alt="Xads" className="h-12" />
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isVendor ? `Signing in as ${vendorLabel}` : mode === "signup" ? "Start your first billboard campaign" : "Sign in to manage your campaigns"}
            </p>
          </div>

          {mode === "signup" && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-12 rounded-xl" />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl" />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12 rounded-xl" />
          </div>

          <Button onClick={handleEmailAuth} disabled={loading || !email || !password} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base gap-2">
            {mode === "signup" ? "Create account" : "Sign in"} <ArrowRight className="w-4 h-4" />
          </Button>

          {!isVendor && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-background px-2 text-xs text-muted-foreground">or</span></div>
              </div>

              <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full h-12 rounded-xl font-semibold text-base gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>

              <button
                onClick={() => setFlow("vendor-pick")}
                className="w-full h-11 rounded-xl border border-dashed border-border text-sm font-medium text-foreground hover:bg-muted/40 transition-colors flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" /> Login as Vendor
              </button>
            </>
          )}

          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-sm text-accent font-medium pt-2">
            {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          Trusted by 1,000+ businesses across India
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
