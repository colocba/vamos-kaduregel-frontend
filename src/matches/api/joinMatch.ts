import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";
import type { ParticipantDoc } from "../../types/participant";

export type JoinMatchInput = {
  matchId: string;
  uid: string;
  name: string;
  isAdmin: boolean;
};

export async function joinMatch(input: JoinMatchInput): Promise<void> {
  const matchRef = doc(db, "matches", input.matchId);
  const partRef = doc(db, "matches", input.matchId, "participants", input.uid);

  await runTransaction(db, async (tx) => {
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    const match = matchSnap.data() as MatchDoc;

    if (match.status !== "open") throw new Error("Match is not open");
    if (match.paidCount + 1 > match.playerLimit) throw new Error("Match is full");

    const existing = await tx.get(partRef);
    if (existing.exists()) throw new Error("You already paid");

    const participant: ParticipantDoc = {
      paidByUid: input.uid,
      paidByName: input.name,
      isGuest: false,
      guestName: null,
      team: null,
      verified: input.isAdmin,
      verifiedBy: input.isAdmin ? input.uid : null,
      paidAt: serverTimestamp() as never,
    };
    tx.set(partRef, participant);

    const newCount = match.paidCount + 1;
    const updates: Partial<MatchDoc> = { paidCount: newCount };
    if (newCount === match.playerLimit) updates.status = "closed";
    tx.update(matchRef, updates);
  });
}
