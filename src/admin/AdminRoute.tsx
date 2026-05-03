import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useIsAdmin } from "./useIsAdmin";

export function AdminRoute() {
  const auth = useAuth();
  const { loading, isAdmin } = useIsAdmin();
  if (auth.status === "loading") return <p className="p-4">…</p>;
  if (auth.status === "signedOut") return <Navigate to="/login" replace />;
  if (loading) return <p className="p-4">…</p>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
