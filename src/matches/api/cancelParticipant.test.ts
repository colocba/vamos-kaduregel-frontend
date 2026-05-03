import { describe, it, expect, beforeEach } from "vitest";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp,
} from "firebase/firestore";
import { connectEmulatorsOnce } from "../../firebase/emulator";
import { db } from "../../firebase/client";
import { cancelParticipant } from "./cancelParticipant";

const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
const describeIfEmu = useEmulators ? describe : describe.skip;
if (useEmulators) connectEmulatorsOnce();

async function clearMatches() {
  const snap = await getDocs(collection(db, "matches"));
  for (const d of snap.docs) {
    const parts = await getDocs(collection(d.ref, "participants"));
    for (const p of parts.docs) await deleteDoc(p.ref);
    await deleteDoc(d.ref);
  }
}

describeIfEmu("cancelParticipant", () => {
  beforeEach(clearMatches);

  it("removes participant and decrements count", async () => {
    const ref = await addDoc(collection(db, "matches"), {
      date: Timestamp.fromMillis(Date.now() + 60_000), location: "X",
      numFields: 1, playerLimit: 12, pricePerPlayer: 0, paymentLink: "",
      notes: "", status: "open", paidCount: 1, createdBy: "a", createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, "matches", ref.id, "participants", "u1"), {
      paidByUid: "u1", paidByName: "Alice", isGuest: false, guestName: null,
      team: null, verified: false, verifiedBy: null, paidAt: Timestamp.now(),
    });
    await cancelParticipant({ matchId: ref.id, participantId: "u1" });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(0);
    expect((await getDoc(doc(db, "matches", ref.id, "participants", "u1"))).exists()).toBe(false);
  });

  it("reopens a closed match when a slot frees", async () => {
    const ref = await addDoc(collection(db, "matches"), {
      date: Timestamp.fromMillis(Date.now() + 60_000), location: "X",
      numFields: 1, playerLimit: 1, pricePerPlayer: 0, paymentLink: "",
      notes: "", status: "closed", paidCount: 1, createdBy: "a", createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, "matches", ref.id, "participants", "u1"), {
      paidByUid: "u1", paidByName: "Alice", isGuest: false, guestName: null,
      team: null, verified: false, verifiedBy: null, paidAt: Timestamp.now(),
    });
    await cancelParticipant({ matchId: ref.id, participantId: "u1" });
    const updated = (await getDoc(ref)).data();
    expect(updated?.status).toBe("open");
    expect(updated?.paidCount).toBe(0);
  });
});
