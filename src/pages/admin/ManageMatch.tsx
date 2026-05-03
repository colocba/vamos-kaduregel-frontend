import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMatch } from "../../matches/hooks/useMatch";
import { useParticipants } from "../../matches/hooks/useParticipants";
import { MatchInfo } from "../../components/MatchInfo";
import { verifyParticipant } from "../../matches/api/verifyParticipant";
import { cancelParticipant } from "../../matches/api/cancelParticipant";
import { assignTeam } from "../../matches/api/assignTeam";
import { teamCount } from "../../matches/helpers/teamCount";
import { useAuth } from "../../auth/useAuth";

export function ManageMatchPage() {
  const { id = null } = useParams();
  const { t } = useTranslation();
  const auth = useAuth();
  const { loading, match } = useMatch(id);
  const { participants } = useParticipants(id);

  if (loading) return <p className="p-4">{t("common.loading")}</p>;
  if (!match || auth.status !== "signedIn") return <p className="p-4">404</p>;
  const uid = auth.user.uid;
  const teams = teamCount(match.numFields);
  const teamOptions = Array.from({ length: teams }, (_, i) => i + 1);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <MatchInfo match={match} />
      <ul className="space-y-1">
        {participants.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded bg-white p-2 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={p.verified}
                onChange={(e) =>
                  verifyParticipant({
                    matchId: match.id,
                    participantId: p.id,
                    verified: e.target.checked,
                    byUid: uid,
                  })
                }
              />
              <span>
                {p.isGuest
                  ? `${p.guestName} (${t("match.guestOf", { name: p.paidByName })})`
                  : p.paidByName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={p.team ?? ""}
                onChange={(e) =>
                  assignTeam({
                    matchId: match.id,
                    participantId: p.id,
                    team:
                      e.target.value === ""
                        ? null
                        : (Number(e.target.value) as 1 | 2 | 3 | 4),
                  })
                }
                className="rounded border p-1 text-sm"
              >
                <option value="">—</option>
                {teamOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => cancelParticipant({ matchId: match.id, participantId: p.id })}
              >
                {t("common.cancel")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
