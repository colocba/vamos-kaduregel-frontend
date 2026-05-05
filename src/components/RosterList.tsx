import { useTranslation } from "react-i18next";
import type { Participant } from "../types/participant";
import { ParticipantRow } from "./ParticipantRow";
import { cancelParticipant } from "../matches/api/cancelParticipant";
import { verifyParticipant } from "../matches/api/verifyParticipant";
import { isUpcoming } from "../matches/helpers/isUpcoming";
import type { Match } from "../types/match";

export function RosterList({
  match,
  participants,
  currentUid,
  isAdmin,
}: {
  match: Match;
  participants: Participant[];
  currentUid: string;
  isAdmin: boolean;
}) {
  const { t } = useTranslation();
  const editable = isUpcoming(match.date) && match.status !== "cancelled";

  return (
    <section className="surface p-4 sm:p-5">
      <header className="flex items-baseline justify-between">
        <h3 className="font-display text-base font-extrabold uppercase tracking-[0.18em] text-ink">
          {t("match.roster")}
        </h3>
        <span className="font-display text-sm font-bold tabular-nums text-ash">
          {participants.length}
          <span className="text-ash-soft"> / {match.playerLimit}</span>
        </span>
      </header>

      {participants.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line bg-paper/50 p-6 text-center text-sm text-ash">
          {t("match.noPlayers")}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {participants.map((p, i) => {
            const ownsRow = p.paidByUid === currentUid;
            const canCancel = editable && (isAdmin || ownsRow);
            return (
              <ParticipantRow
                key={p.id}
                participant={p}
                index={i}
                canCancel={canCancel}
                onCancel={
                  canCancel
                    ? () => cancelParticipant({ matchId: match.id, participantId: p.id })
                    : undefined
                }
                canVerify={isAdmin}
                onToggleVerify={
                  isAdmin
                    ? () =>
                        verifyParticipant({
                          matchId: match.id,
                          participantId: p.id,
                          verified: !p.verified,
                          byUid: currentUid,
                        })
                    : undefined
                }
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
