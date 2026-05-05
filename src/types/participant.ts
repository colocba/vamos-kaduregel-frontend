import type { Timestamp } from "firebase/firestore";

export type ParticipantDoc = {
  paidByUid: string;
  paidByName: string;
  isGuest: boolean;
  guestName: string | null;
  team: number | null;
  verified: boolean;
  verifiedBy: string | null;
  paidAt: Timestamp;
};

export type Participant = ParticipantDoc & { id: string };
