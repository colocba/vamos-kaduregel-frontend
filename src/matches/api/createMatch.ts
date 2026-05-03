import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";
import { deriveLimit } from "../helpers/deriveLimit";

export type CreateMatchInput = {
  date: Date;
  location: string;
  numFields: 1 | 2;
  pricePerPlayer: number;
  paymentLink: string;
  notes: string;
  createdBy: string;
};

export async function createMatch(input: CreateMatchInput): Promise<string> {
  const docData: Omit<MatchDoc, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    date: Timestamp.fromDate(input.date),
    location: input.location,
    numFields: input.numFields,
    playerLimit: deriveLimit(input.numFields),
    pricePerPlayer: input.pricePerPlayer,
    paymentLink: input.paymentLink,
    notes: input.notes,
    status: "open",
    paidCount: 0,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "matches"), docData);
  return ref.id;
}
