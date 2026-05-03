import { createContext } from "react";
import type { User } from "firebase/auth";

export type AuthState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; user: User };

export const AuthContext = createContext<AuthState>({ status: "loading" });
