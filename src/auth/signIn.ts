import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/client";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  await signInWithPopup(auth, provider);
}
