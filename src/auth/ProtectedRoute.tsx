import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const auth = useAuth();
  if (auth.status === "loading") return <p className="p-4">…</p>;
  if (auth.status === "signedOut") return <Navigate to="/login" replace />;
  return <Outlet />;
}
