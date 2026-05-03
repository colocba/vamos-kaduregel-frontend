import { signOut as fbSignOut } from "firebase/auth";
import { auth } from "../firebase/client";

export async function signOut() {
  await fbSignOut(auth);
}
