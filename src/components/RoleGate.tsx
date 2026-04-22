import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";

const VENDOR_ROLES: AppRole[] = ["property_owner", "printing_vendor", "agency"];

const RoleGate = ({ children, allow }: { children: JSX.Element; allow: AppRole[] | "vendor" | "any" }) => {
  const { user, loading, primaryRole, roleLoading } = useAuth();
  const location = useLocation();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!primaryRole) return <Navigate to="/select-role" state={{ from: location.pathname }} replace />;

  const allowed = allow === "any"
    ? true
    : allow === "vendor"
      ? VENDOR_ROLES.includes(primaryRole)
      : allow.includes(primaryRole);

  if (!allowed) {
    // Send to their proper dashboard
    if (VENDOR_ROLES.includes(primaryRole)) return <Navigate to="/vendor/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default RoleGate;
