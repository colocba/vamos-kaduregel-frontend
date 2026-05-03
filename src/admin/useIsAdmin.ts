import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/client";
import { useAuth } from "../auth/useAuth";

type LoadedState = {
  uid: string | null;
  isAdmin: boolean;
};

export function useIsAdmin(): boolean {
  const auth = useAuth();
  const uid = auth.status === "signedIn" ? auth.user.uid : null;
  const [loaded, setLoaded] = useState<LoadedState>({ uid: null, isAdmin: false });

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, "users", uid), (snap) => {
      setLoaded({
        uid,
        isAdmin: snap.exists() && !!snap.data()?.isAdmin,
      });
    });
  }, [uid]);

  if (uid === null) return false;
  if (loaded.uid !== uid) return false;
  return loaded.isAdmin;
}
