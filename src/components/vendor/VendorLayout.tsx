import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, List, MessageSquare, Map as MapIcon, BarChart3, Bell, LogOut, Settings, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/xads-logo.png";

const NAV = [
  { to: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/vendor/listings", icon: List, label: "Listings" },
  { to: "/vendor/map", icon: MapIcon, label: "Map" },
  { to: "/vendor/messages", icon: MessageSquare, label: "Messages" },
  { to: "/vendor/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/vendor/notifications", icon: Bell, label: "Notifications" },
];

const ROLE_LABELS: Record<string, string> = {
  property_owner: "Property Owner",
  printing_vendor: "Printing Vendor",
  agency: "Agency",
  business: "Business",
};

const VendorLayout = ({ children }: { children: ReactNode }) => {
  const { signOut, primaryRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/40 backdrop-blur-sm">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <img src={logo} alt="Xads" className="h-7" />
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">Vendor</span>
        </div>
        <div className="px-4 py-4">
          <div className="text-xs text-muted-foreground">Logged in as</div>
          <div className="text-sm font-semibold text-foreground">{ROLE_LABELS[primaryRole ?? ""] ?? "Vendor"}</div>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`
              }
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <button onClick={() => navigate("/profile")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground">
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button onClick={() => navigate("/home")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground">
            <Sparkles className="w-4 h-4" /> Switch to Buyer
          </button>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-card/80 backdrop-blur border-b border-border flex items-center px-4 gap-3 overflow-x-auto">
        <img src={logo} alt="Xads" className="h-6 shrink-0" />
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </NavLink>
        ))}
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default VendorLayout;
