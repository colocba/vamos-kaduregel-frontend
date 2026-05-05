import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { Match } from "../../types/match";
import { normalizeMatchDoc } from "../helpers/normalizeMatch";

export type UseMatchResult = { loading: boolean; match: Match | null };

export function useMatch(matchId: string | null): UseMatchResult {
  const [loaded, setLoaded] = useState<{ matchId: string | null; match: Match | null }>({
    matchId: null,
    match: null,
  });

  useEffect(() => {
    if (!matchId) return;
    return onSnapshot(doc(db, "matches", matchId), (snap) => {
      setLoaded({
        matchId,
        match: snap.exists() ? { id: snap.id, ...normalizeMatchDoc(snap.data()) } : null,
      });
    });
  }, [matchId]);

  if (matchId === null) {
    return { loading: false, match: null };
  }
  if (loaded.matchId !== matchId) {
    return { loading: true, match: null };
  }
  return { loading: false, match: loaded.match };
}
