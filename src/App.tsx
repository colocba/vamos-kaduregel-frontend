import { BrowserRouter, Route, Routes, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { Header } from "./components/Header";
import { LoginPage } from "./pages/Login";
import { HomePage } from "./pages/Home";
import { NotFoundPage } from "./pages/NotFound";
import { PastMatchesPage } from "./pages/PastMatches";
import { PastMatchDetailPage } from "./pages/PastMatchDetail";
import { MatchDetailPage } from "./pages/MatchDetail";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminRoute } from "./admin/AdminRoute";
import { CreateMatchPage } from "./pages/admin/CreateMatch";
import { UsersListPage } from "./pages/admin/UsersList";
import { useAuth } from "./auth/useAuth";

function LoginGate() {
  const auth = useAuth();
  if (auth.status === "signedIn") return <Navigate to="/" replace />;
  return <LoginPage />;
}

function LegacyAdminMatchRedirect() {
  const { id } = useParams();
  return <Navigate to={`/match/${id}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-full flex-col">
          <Header />
          <Routes>
            <Route path="/login" element={<LoginGate />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/match/:id" element={<MatchDetailPage />} />
              <Route path="/past" element={<PastMatchesPage />} />
              <Route path="/past/:id" element={<PastMatchDetailPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin/create" element={<CreateMatchPage />} />
                <Route path="/admin/match/:id" element={<LegacyAdminMatchRedirect />} />
                <Route path="/admin/users" element={<UsersListPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
