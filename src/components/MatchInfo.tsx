import { useTranslation } from "react-i18next";
import type { Match } from "../types/match";

export function MatchInfo({ match }: { match: Match }) {
  const { t, i18n } = useTranslation();
  const dateFmt = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="rounded-lg bg-white p-4 shadow">
      <p className="text-lg font-semibold">{dateFmt.format(match.date.toDate())}</p>
      <p className="mt-1 text-slate-700">{match.location}</p>
      <p className="mt-1 text-slate-500">
        {match.pricePerPlayer} · {match.paidCount} / {match.playerLimit}
      </p>
      <p className="mt-2 text-sm">{t(`match.${match.status}`)}</p>
      {match.notes && <p className="mt-3 text-sm text-slate-600">{match.notes}</p>}
    </section>
  );
}
