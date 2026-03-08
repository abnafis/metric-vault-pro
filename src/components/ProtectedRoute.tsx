import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <BarChart3 className="w-8 h-8 text-glow-blue animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
