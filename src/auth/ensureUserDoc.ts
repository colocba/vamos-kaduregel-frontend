import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase/client";
import type { Locale } from "../constants";

export async function ensureUserDoc(user: User, resolvedLocale: Locale): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  await setDoc(ref, {
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
    isAdmin: false,
    locale: resolvedLocale,
    createdAt: serverTimestamp(),
  });
}
