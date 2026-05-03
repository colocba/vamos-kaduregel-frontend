import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, type Locale } from "../constants";

const LABELS: Record<Locale, string> = { he: "עברית", es: "Español", en: "English" };

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "he") as Locale;

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("language.switcher")}</span>
      <select
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
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
