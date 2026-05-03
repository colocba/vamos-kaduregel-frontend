import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { Header } from "./components/Header";
import { LoginPage } from "./pages/Login";
import { HomePage } from "./pages/Home";
import { NotFoundPage } from "./pages/NotFound";
import { PastMatchesPage } from "./pages/PastMatches";
import { PastMatchDetailPage } from "./pages/PastMatchDetail";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminRoute } from "./admin/AdminRoute";
import { CreateMatchPage } from "./pages/admin/CreateMatch";
import { useAuth } from "./auth/useAuth";

function LoginGate() {
  const auth = useAuth();
  if (auth.status === "signedIn") return <Navigate to="/" replace />;
  return <LoginPage />;
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
              <Route path="/past" element={<PastMatchesPage />} />
              <Route path="/past/:id" element={<PastMatchDetailPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin/create" element={<CreateMatchPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
