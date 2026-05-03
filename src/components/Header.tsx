import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { APP_NAME } from "../constants";
import { useAuth } from "../auth/useAuth";
import { signOut } from "../auth/signOut";
import { useIsAdmin } from "../admin/useIsAdmin";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();
  const auth = useAuth();
  const { isAdmin } = useIsAdmin();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <h1 className="text-lg font-bold sm:text-xl">{APP_NAME}</h1>
      <div className="flex items-center gap-3">
        {auth.status === "signedIn" && (
          <Link to="/past" className="text-sm text-slate-700 hover:underline">
            {t("nav.past")}
          </Link>
        )}
        {auth.status === "signedIn" && isAdmin && (
          <Link to="/admin/create" className="text-sm text-slate-700 hover:underline">
            {t("admin.createMatch")}
          </Link>
        )}
        {auth.status === "signedIn" && isAdmin && (
          <Link to="/admin/users" className="text-sm text-slate-700 hover:underline">
            {t("admin.users")}
          </Link>
        )}
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
