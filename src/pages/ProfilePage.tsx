import { useNavigate } from "react-router-dom";
import { User, Settings, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const menuItems = [
  { icon: User, label: "Account Settings" },
  { icon: Settings, label: "Preferences" },
  { icon: HelpCircle, label: "Help & Support" },
];

const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <User className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">John Doe</h1>
            <p className="text-sm text-muted-foreground">+91 98765 43210</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-1">
        {menuItems.map(({ icon: Icon, label }) => (
          <button key={label} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-destructive/5 transition-colors text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
