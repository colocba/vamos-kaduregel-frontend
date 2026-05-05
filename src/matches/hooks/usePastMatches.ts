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

export function usePastMatches(maxItems = 50) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "matches"),
      where("date", "<=", Timestamp.now()),
      orderBy("date", "desc"),
      limit(maxItems),
    );
    return onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...normalizeMatchDoc(d.data()) })));
      setLoading(false);
    });
  }, [maxItems]);

  return { loading, matches };
}
