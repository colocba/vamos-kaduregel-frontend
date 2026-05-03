import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/client";

export async function verifyParticipant(args: {
  matchId: string;
  participantId: string;
  verified: boolean;
  byUid: string;
}) {
  await updateDoc(doc(db, "matches", args.matchId, "participants", args.participantId), {
    verified: args.verified,
    verifiedBy: args.verified ? args.byUid : null,
  });
}
