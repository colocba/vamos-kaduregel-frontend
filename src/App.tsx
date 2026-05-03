import { AuthProvider } from "./auth/AuthProvider";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { APP_NAME } from "./constants";

export default function App() {
  const { t } = useTranslation();
  return (
    <AuthProvider>
      <main className="min-h-full p-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <LanguageSwitcher />
        </header>
        <p className="mt-8 text-center text-slate-600">{t("match.noUpcoming")}</p>
      </main>
    </AuthProvider>
  );
}
