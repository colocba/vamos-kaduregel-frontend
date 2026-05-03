import type { Participant } from "../types/participant";
import { ParticipantRow } from "./ParticipantRow";
import { cancelParticipant } from "../matches/api/cancelParticipant";
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
  const editable = isUpcoming(match.date) && match.status !== "cancelled";
  return (
    <ul className="space-y-1">
      {participants.map((p) => {
        const ownsRow = p.paidByUid === currentUid;
        const canCancel = editable && (isAdmin || ownsRow);
        return (
          <ParticipantRow
            key={p.id}
            participant={p}
            canCancel={canCancel}
            onCancel={
              canCancel
                ? () => cancelParticipant({ matchId: match.id, participantId: p.id })
                : undefined
            }
          />
        );
      })}
    </ul>
  );
}
