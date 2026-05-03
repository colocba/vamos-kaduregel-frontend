import { useTranslation } from "react-i18next";
import { useNextMatch } from "../matches/hooks/useNextMatch";
import { MatchInfo } from "../components/MatchInfo";

export function HomePage() {
  const { t } = useTranslation();
  const { loading, match } = useNextMatch();

  if (loading) return <p className="p-4">{t("common.loading")}</p>;
  if (!match)
    return <p className="p-4 text-center text-slate-600">{t("match.noUpcoming")}</p>;

  return (
    <main className="mx-auto max-w-2xl p-4">
      <MatchInfo match={match} />
    </main>
  );
}
