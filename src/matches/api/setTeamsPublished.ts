import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/client";

export async function setTeamsPublished(matchId: string, published: boolean): Promise<void> {
  await updateDoc(doc(db, "matches", matchId), { teamsPublished: published });
}
