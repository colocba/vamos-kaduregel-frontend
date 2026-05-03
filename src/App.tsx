import { useTranslation } from "react-i18next";
import { APP_NAME } from "./constants";

export default function App() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-full items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{APP_NAME}</h1>
        <p className="mt-2 text-slate-600">{t("match.noUpcoming")}</p>
      </div>
    </main>
  );
}
