import { doc, writeBatch } from "firebase/firestore";
import { db } from "../../firebase/client";

export type TeamAssignment = {
  participantId: string;
  team: number | null;
};

export async function setParticipantTeams(matchId: string, assignments: TeamAssignment[]) {
  if (assignments.length === 0) return;
  const batch = writeBatch(db);
  for (const a of assignments) {
    batch.update(doc(db, "matches", matchId, "participants", a.participantId), {
      team: a.team,
    });
  }
  await batch.commit();
}
