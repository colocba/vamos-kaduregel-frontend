import { doc, runTransaction } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";

export type CancelInput = { matchId: string; participantId: string };

export async function cancelParticipant({ matchId, participantId }: CancelInput): Promise<void> {
  const matchRef = doc(db, "matches", matchId);
  const partRef = doc(db, "matches", matchId, "participants", participantId);

  await runTransaction(db, async (tx) => {
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    const match = matchSnap.data() as MatchDoc;
    const partSnap = await tx.get(partRef);
    if (!partSnap.exists()) return;

    tx.delete(partRef);
    const newCount = Math.max(0, match.paidCount - 1);
    const updates: Partial<MatchDoc> = { paidCount: newCount };
    if (match.status === "closed" && newCount < match.playerLimit) updates.status = "open";
    tx.update(matchRef, updates);
  });
}
