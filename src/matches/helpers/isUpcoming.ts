import type { Timestamp } from "firebase/firestore";
export function isUpcoming(date: Timestamp): boolean {
  return date.toMillis() > Date.now();
}
