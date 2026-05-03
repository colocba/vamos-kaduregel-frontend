import type { Timestamp } from "firebase/firestore";
import type { Locale } from "../constants";

export type UserDoc = {
  displayName: string;
  email: string;
  photoURL: string;
  isAdmin: boolean;
  locale: Locale;
  createdAt: Timestamp;
};
