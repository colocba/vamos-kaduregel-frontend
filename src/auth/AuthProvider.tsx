import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/client";
import { AuthContext, type AuthState } from "./AuthContext";
import { ensureUserDoc } from "./ensureUserDoc";
import i18n from "../i18n";
import type { Locale } from "../constants";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await ensureUserDoc(user, (i18n.resolvedLanguage ?? "he") as Locale);
        if (!cancelled) setState({ status: "signedIn", user });
      } else if (!cancelled) {
        setState({ status: "signedOut" });
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
