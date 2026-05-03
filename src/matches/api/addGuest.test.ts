import { describe, it, expect, beforeEach } from "vitest";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { connectEmulatorsOnce } from "../../firebase/emulator";
import { db } from "../../firebase/client";
import { addGuest } from "./addGuest";

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

describeIfEmu("addGuest", () => {
  beforeEach(clearMatches);

  it("adds one guest, +1 to count", async () => {
    const ref = await addDoc(collection(db, "matches"), {
      date: Timestamp.fromMillis(Date.now() + 60_000),
      location: "X",
      numFields: 1,
      playerLimit: 12,
      pricePerPlayer: 0,
      paymentLink: "",
      notes: "",
      status: "open",
      paidCount: 1,
      createdBy: "a",
      createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, "matches", ref.id, "participants", "u1"), {
      paidByUid: "u1",
      paidByName: "Alice",
      isGuest: false,
      guestName: null,
      team: null,
      verified: false,
      verifiedBy: null,
      paidAt: Timestamp.now(),
    });
    await addGuest({
      matchId: ref.id,
      uid: "u1",
      name: "Alice",
      guestName: "Bob",
      isAdmin: false,
    });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(2);
  });
});
