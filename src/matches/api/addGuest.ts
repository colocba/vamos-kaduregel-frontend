import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";
import type { ParticipantDoc } from "../../types/participant";

export type AddGuestInput = {
  matchId: string;
  uid: string;
  name: string;
  guestName: string;
  isAdmin: boolean;
};

export async function addGuest(input: AddGuestInput): Promise<void> {
  if (!input.guestName.trim()) throw new Error("Guest name is required");
  const matchRef = doc(db, "matches", input.matchId);
  const guestRef = doc(collection(db, "matches", input.matchId, "participants"));

  await runTransaction(db, async (tx) => {
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    const match = matchSnap.data() as MatchDoc;

    if (match.status !== "open") throw new Error("Match is not open");
    if (match.paidCount + 1 > match.playerLimit) throw new Error("Match is full");

    const guest: ParticipantDoc = {
      paidByUid: input.uid,
      paidByName: input.name,
      isGuest: true,
      guestName: input.guestName.trim(),
      team: null,
      verified: input.isAdmin,
      verifiedBy: input.isAdmin ? input.uid : null,
      paidAt: serverTimestamp() as never,
    };
    tx.set(guestRef, guest);

    const newCount = match.paidCount + 1;
    const updates: Partial<MatchDoc> = { paidCount: newCount };
    if (newCount === match.playerLimit) updates.status = "closed";
    tx.update(matchRef, updates);
  });
}
