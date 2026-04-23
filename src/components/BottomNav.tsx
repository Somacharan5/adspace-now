import { Home, LayoutGrid, User, MessageSquare, Inbox } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Inbox, label: "Orders", path: "/orders" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: LayoutGrid, label: "Campaigns", path: "/campaigns" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active =
            location.pathname === path ||
            (path === "/campaigns" && location.pathname.startsWith("/campaign")) ||
            (path === "/orders" && location.pathname.startsWith("/orders")) ||
            (path === "/messages" && location.pathname.startsWith("/messages"));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
