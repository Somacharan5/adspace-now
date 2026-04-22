import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading, primaryRole, roleLoading } = useAuth();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!primaryRole) return <Navigate to="/select-role" replace />;

  // Vendors should be in vendor portal
  if (primaryRole !== "business" && primaryRole !== "user" && primaryRole !== "admin") {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
