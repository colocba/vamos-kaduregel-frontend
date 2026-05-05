import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/client";

export type UpdateMatchInput = {
  matchId: string;
  patch: Partial<{
    date: Date;
    location: string;
    numTeams: number;
    playerLimit: number;
    pricePerPlayer: number;
    paymentLink: string;
    notes: string;
  }>;
};

export async function updateMatch({ matchId, patch }: UpdateMatchInput): Promise<void> {
  const updates: Record<string, unknown> = { ...patch };
  if (patch.date) updates.date = Timestamp.fromDate(patch.date);
  await updateDoc(doc(db, "matches", matchId), updates);
}
