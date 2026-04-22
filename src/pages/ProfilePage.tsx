import { useNavigate } from "react-router-dom";
import { User, Settings, HelpCircle, LogOut, ChevronRight, Briefcase, Users as UsersIcon, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setProfile(data));
  }, [user]);

  const menuItems = [
    { icon: User, label: "Account Settings", desc: "Personal info, email, password", path: "/profile/account" },
    { icon: Briefcase, label: "Business Profile", desc: "Help our AI understand your business", path: "/profile/business" },
    { icon: UsersIcon, label: "Team", desc: "Invite teammates by email or phone", path: "/profile/team" },
    { icon: Sparkles, label: "Talk to Xads", desc: "AI marketing consultant", path: "/talk-to-xads" },
    { icon: HelpCircle, label: "Help & Support", desc: "Get help when you need it", path: "/profile" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <User className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{profile?.full_name || "Welcome"}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-1">
        {menuItems.map(({ icon: Icon, label, desc, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Icon className="w-4 h-4 text-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground">{desc}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-destructive/5 transition-colors text-destructive mt-4">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
