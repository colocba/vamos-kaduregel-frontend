import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchStatus } from "../../types/match";

export async function setMatchStatus(matchId: string, status: MatchStatus): Promise<void> {
  await updateDoc(doc(db, "matches", matchId), { status });
}
