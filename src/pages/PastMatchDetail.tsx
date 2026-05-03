import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMatch } from "../matches/hooks/useMatch";
import { useParticipants } from "../matches/hooks/useParticipants";
import { MatchInfo } from "../components/MatchInfo";

export function PastMatchDetailPage() {
  const { id = null } = useParams();
  const { t } = useTranslation();
  const { loading, match } = useMatch(id);
  const { participants } = useParticipants(id);

  if (loading) return <p className="p-4">{t("common.loading")}</p>;
  if (!match) return <p className="p-4">404</p>;

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <MatchInfo match={match} />
      <ul className="space-y-1">
        {participants.map((p) => (
          <li key={p.id} className="rounded bg-white p-2 shadow-sm">
            {p.isGuest
              ? `${p.guestName} (${t("match.guestOf", { name: p.paidByName })})`
              : p.paidByName}
            {p.team && (
              <span className="ms-2 text-sm text-slate-500">
                · {t("match.team", { n: p.team })}
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
