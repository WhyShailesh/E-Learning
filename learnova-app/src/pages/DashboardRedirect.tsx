import { Navigate } from "react-router-dom";
import { useAuth, getRoleRedirect } from "@/contexts/AuthContext";

export default function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={getRoleRedirect(user.role)} replace />;
}
