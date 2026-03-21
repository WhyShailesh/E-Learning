import { Navigate, useLocation } from "react-router-dom";
import { useAuth, getRoleRedirect } from "@/contexts/AuthContext";

export function RequireAuth({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleRedirect(user.role)} replace />;
  }

  return <>{children}</>;
}

export function RedirectIfAuth() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={getRoleRedirect(user.role)} replace />;
  }
  return null;
}
