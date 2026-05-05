import { useTranslation } from "react-i18next";
import { doc, updateDoc } from "firebase/firestore";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "../constants";
import { useAuth } from "../auth/useAuth";
import { db } from "../firebase/client";

const LABELS: Record<Locale, string> = { he: "עברית", es: "Español", en: "English" };
const SHORT: Record<Locale, string> = { he: "HE", es: "ES", en: "EN" };

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
        // best-effort
      }
    }
  }

  return (
    <label className="relative inline-flex items-center gap-2">
      <span className="sr-only">{t("language.switcher")}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute start-3 font-display text-[10px] font-extrabold tracking-[0.18em] text-ash"
      >
        {SHORT[current]}
      </span>
      <select
        value={current}
        onChange={(e) => {
          void handleChange(e.target.value as Locale);
        }}
        className="appearance-none rounded-full border border-line bg-white py-1.5 ps-10 pe-7 text-xs font-semibold text-ink shadow-card focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-200"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LABELS[loc]}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="pointer-events-none absolute end-2 h-3 w-3 text-ash"
        fill="none"
      >
        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </label>
  );
}
