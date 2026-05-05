import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { addDoc, collection, deleteDoc, getDocs, Timestamp } from "firebase/firestore";
import { connectEmulatorsOnce } from "../../firebase/emulator";
import { db } from "../../firebase/client";
import { useNextMatch } from "./useNextMatch";

// These tests need the Firestore emulator running. Run them via
// `npm run test:emu` (requires Java + firebase-tools). When CI is set up,
// it MUST run `test:emu` against the emulator — otherwise this suite
// silently skips.
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
const describeIfEmu = useEmulators ? describe : describe.skip;
if (useEmulators) connectEmulatorsOnce();

async function clearMatches() {
  const snap = await getDocs(collection(db, "matches"));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

describeIfEmu("useNextMatch", () => {
  beforeEach(clearMatches);

  it("returns null when there is no future open/closed match", async () => {
    const { result } = renderHook(() => useNextMatch());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.match).toBeNull();
  });

  it("returns the soonest non-cancelled future match", async () => {
    const future = Timestamp.fromMillis(Date.now() + 60_000);
    const fartherFuture = Timestamp.fromMillis(Date.now() + 120_000);
    await addDoc(collection(db, "matches"), {
      date: fartherFuture,
      location: "B",
      numTeams: 2,
      playerLimit: 12,
      pricePerPlayer: 50,
      paymentLink: "x",
      notes: "",
      status: "open",
      paidCount: 0,
      createdBy: "u1",
      createdAt: Timestamp.now(),
    });
    await addDoc(collection(db, "matches"), {
      date: future,
      location: "A",
      numTeams: 2,
      playerLimit: 12,
      pricePerPlayer: 50,
      paymentLink: "x",
      notes: "",
      status: "open",
      paidCount: 0,
      createdBy: "u1",
      createdAt: Timestamp.now(),
    });
    const { result } = renderHook(() => useNextMatch());
    await waitFor(() => expect(result.current.match?.location).toBe("A"));
  });
});
