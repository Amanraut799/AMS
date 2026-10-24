import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../layout/AppLayout";

function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === "ADMIN" ? "/admin" : "/employee"} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default ProtectedRoute;
