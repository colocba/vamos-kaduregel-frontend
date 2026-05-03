import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import { deriveLimit } from "../helpers/deriveLimit";

export type UpdateMatchInput = {
  matchId: string;
  patch: Partial<{
    date: Date;
    location: string;
    numFields: 1 | 2;
    pricePerPlayer: number;
    paymentLink: string;
    notes: string;
  }>;
};

export async function updateMatch({ matchId, patch }: UpdateMatchInput): Promise<void> {
  const updates: Record<string, unknown> = { ...patch };
  if (patch.date) updates.date = Timestamp.fromDate(patch.date);
  if (patch.numFields !== undefined) updates.playerLimit = deriveLimit(patch.numFields);
  await updateDoc(doc(db, "matches", matchId), updates);
}
