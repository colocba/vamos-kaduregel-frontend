import type { Timestamp } from "firebase/firestore";

export type MatchStatus = "open" | "closed" | "cancelled";

export type MatchDoc = {
  date: Timestamp;
  location: string;
  numFields: 1 | 2;
  playerLimit: number;
  pricePerPlayer: number;
  paymentLink: string;
  notes: string;
  status: MatchStatus;
  paidCount: number;
  createdBy: string;
  createdAt: Timestamp;
};

export type Match = MatchDoc & { id: string };
