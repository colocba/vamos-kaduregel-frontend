import { AuthProvider } from "./auth/AuthProvider";
import { Header } from "./components/Header";
import { LoginPage } from "./pages/Login";
import { useAuth } from "./auth/useAuth";

function Body() {
  const auth = useAuth();
  if (auth.status === "loading") return <p className="p-4">…</p>;
  if (auth.status === "signedOut") return <LoginPage />;
  return <p className="p-4">Signed in as {auth.user.displayName}</p>;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-full flex-col">
        <Header />
        <Body />
      </div>
    </AuthProvider>
  );
}
