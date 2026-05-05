import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/client";
import type { Match } from "../../types/match";
import { normalizeMatchDoc } from "../helpers/normalizeMatch";

export type UseNextMatchResult = { loading: boolean; match: Match | null };

export function useNextMatch(): UseNextMatchResult {
  const [state, setState] = useState<UseNextMatchResult>({
    loading: true,
    match: null,
  });

  useEffect(() => {
    const q = query(
      collection(db, "matches"),
      where("date", ">", Timestamp.now()),
      where("status", "in", ["open", "closed"]),
      orderBy("date", "asc"),
      limit(1),
    );
    return onSnapshot(q, (snap) => {
      const first = snap.docs[0];
      setState({
        loading: false,
        match: first ? { id: first.id, ...normalizeMatchDoc(first.data()) } : null,
      });
    });
  }, []);

  return state;
}
