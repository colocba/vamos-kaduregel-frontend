import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";
import type { ParticipantDoc } from "../../types/participant";

export type JoinMatchInput = {
  matchId: string;
  uid: string;
  name: string;
  isAdmin: boolean;
  guestName?: string;
};

export async function joinMatch(input: JoinMatchInput): Promise<void> {
  const matchRef = doc(db, "matches", input.matchId);
  const partRef = doc(db, "matches", input.matchId, "participants", input.uid);
  const wantGuest = !!input.guestName?.trim();
  const guestRef = wantGuest ? doc(collection(db, "matches", input.matchId, "participants")) : null;

  await runTransaction(db, async (tx) => {
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    const match = matchSnap.data() as MatchDoc;

    if (match.status !== "open") throw new Error("Match is not open");
    const slots = wantGuest ? 2 : 1;
    if (match.paidCount + slots > match.playerLimit) throw new Error("Match is full");

    const existing = await tx.get(partRef);
    if (existing.exists()) throw new Error("You already paid");

    const self: ParticipantDoc = {
      paidByUid: input.uid,
      paidByName: input.name,
      isGuest: false,
      guestName: null,
      team: null,
      verified: input.isAdmin,
      verifiedBy: input.isAdmin ? input.uid : null,
      paidAt: serverTimestamp() as never,
    };
    tx.set(partRef, self);

    if (guestRef && wantGuest) {
      const guest: ParticipantDoc = {
        paidByUid: input.uid,
        paidByName: input.name,
        isGuest: true,
        guestName: input.guestName!.trim(),
        team: null,
        verified: input.isAdmin,
        verifiedBy: input.isAdmin ? input.uid : null,
        paidAt: serverTimestamp() as never,
      };
      tx.set(guestRef, guest);
    }

    const newCount = match.paidCount + slots;
    const updates: Partial<MatchDoc> = { paidCount: newCount };
    if (newCount === match.playerLimit) updates.status = "closed";
    tx.update(matchRef, updates);
  });
}
