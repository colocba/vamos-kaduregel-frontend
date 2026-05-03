import { useTranslation } from "react-i18next";
import { APP_NAME } from "../constants";
import { useAuth } from "../auth/useAuth";
import { signOut } from "../auth/signOut";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();
  const auth = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <h1 className="text-lg font-bold sm:text-xl">{APP_NAME}</h1>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        {auth.status === "signedIn" && (
          <button
            onClick={() => signOut()}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            {t("auth.signOut")}
          </button>
        )}
      </div>
    </header>
  );
}
