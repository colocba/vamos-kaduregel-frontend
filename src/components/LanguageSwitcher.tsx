import { useTranslation } from "react-i18next";
import { doc, updateDoc } from "firebase/firestore";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "../constants";
import { useAuth } from "../auth/useAuth";
import { db } from "../firebase/client";

const LABELS: Record<Locale, string> = { he: "עברית", es: "Español", en: "English" };

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const auth = useAuth();
  const current = (i18n.resolvedLanguage ?? DEFAULT_LOCALE) as Locale;

  async function handleChange(newLocale: Locale) {
    await i18n.changeLanguage(newLocale);
    if (auth.status === "signedIn") {
      try {
        await updateDoc(doc(db, "users", auth.user.uid), { locale: newLocale });
      } catch {
        // best-effort: do not break the UI if the persistence write fails
      }
    }
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("language.switcher")}</span>
      <select
        value={current}
        onChange={(e) => {
          void handleChange(e.target.value as Locale);
        }}
        className="rounded border border-slate-300 bg-white px-2 py-1"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LABELS[loc]}
          </option>
        ))}
      </select>
    </label>
  );
}
