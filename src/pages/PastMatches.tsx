import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePastMatches } from "../matches/hooks/usePastMatches";

export function PastMatchesPage() {
  const { t, i18n } = useTranslation();
  const { loading, matches } = usePastMatches();
  const fmt = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium" });

  if (loading) return <p className="p-4">{t("common.loading")}</p>;

  return (
    <main className="mx-auto max-w-2xl space-y-2 p-4">
      {matches.map((m) => (
        <Link
          key={m.id}
          to={`/past/${m.id}`}
          className="block rounded-lg bg-white p-3 shadow hover:bg-slate-50"
        >
          <p className="font-medium">{fmt.format(m.date.toDate())}</p>
          <p className="text-sm text-slate-500">{m.location}</p>
        </Link>
      ))}
    </main>
  );
}
