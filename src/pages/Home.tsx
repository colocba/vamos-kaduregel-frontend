import { useTranslation } from "react-i18next";
export function HomePage() {
  const { t } = useTranslation();
  return <p className="p-4 text-center text-slate-600">{t("match.noUpcoming")}</p>;
}
