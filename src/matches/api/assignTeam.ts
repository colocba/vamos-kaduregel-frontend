import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/client";

export async function assignTeam(args: {
  matchId: string;
  participantId: string;
  team: 1 | 2 | 3 | 4 | null;
}) {
  await updateDoc(doc(db, "matches", args.matchId, "participants", args.participantId), {
    team: args.team,
  });
}
