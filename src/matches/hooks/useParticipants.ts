import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { Participant, ParticipantDoc } from "../../types/participant";

export type UseParticipantsResult = {
  loading: boolean;
  participants: Participant[];
};

type LoadedState = {
  matchId: string | null;
  participants: Participant[];
};

export function useParticipants(matchId: string | null): UseParticipantsResult {
  const [loaded, setLoaded] = useState<LoadedState>({
    matchId: null,
    participants: [],
  });

  useEffect(() => {
    if (!matchId) return;
    const q = query(
      collection(db, "matches", matchId, "participants"),
      orderBy("paidAt", "asc"),
    );
    return onSnapshot(q, (snap) => {
      setLoaded({
        matchId,
        participants: snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as ParticipantDoc),
        })),
      });
    });
  }, [matchId]);

  if (matchId === null) {
    return { loading: false, participants: [] };
  }
  if (loaded.matchId !== matchId) {
    return { loading: true, participants: [] };
  }
  return { loading: false, participants: loaded.participants };
}
