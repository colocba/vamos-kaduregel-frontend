import { describe, it, expect, beforeEach } from "vitest";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp,
} from "firebase/firestore";
import { connectEmulatorsOnce } from "../../firebase/emulator";
import { db } from "../../firebase/client";
import { joinMatch } from "./joinMatch";

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

const baseMatch = (overrides: Record<string, unknown> = {}) => ({
  date: Timestamp.fromMillis(Date.now() + 60_000),
  location: "Field A",
  numFields: 1 as const,
  playerLimit: 12,
  pricePerPlayer: 50,
  paymentLink: "https://pay/x",
  notes: "",
  status: "open" as const,
  paidCount: 0,
  createdBy: "admin",
  createdAt: Timestamp.now(),
  ...overrides,
});

describeIfEmu("joinMatch (self only)", () => {
  beforeEach(clearMatches);

  it("creates a self participant doc and increments paidCount", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch());
    await joinMatch({ matchId: ref.id, uid: "u1", name: "Alice", isAdmin: false });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(1);
    const part = (await getDoc(doc(db, "matches", ref.id, "participants", "u1"))).data();
    expect(part?.paidByUid).toBe("u1");
    expect(part?.isGuest).toBe(false);
    expect(part?.verified).toBe(false);
  });

  it("auto-verifies admin self-entries", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch());
    await joinMatch({ matchId: ref.id, uid: "admin1", name: "A", isAdmin: true });
    const part = (await getDoc(doc(db, "matches", ref.id, "participants", "admin1"))).data();
    expect(part?.verified).toBe(true);
    expect(part?.verifiedBy).toBe("admin1");
  });

  it("flips status to closed when limit hit", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch({ playerLimit: 2, paidCount: 1 }));
    await setDoc(doc(db, "matches", ref.id, "participants", "other"), {
      paidByUid: "other", paidByName: "O", isGuest: false, guestName: null,
      team: null, verified: false, verifiedBy: null, paidAt: Timestamp.now(),
    });
    await joinMatch({ matchId: ref.id, uid: "u2", name: "Bob", isAdmin: false });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(2);
    expect(updated?.status).toBe("closed");
  });

  it("rejects when match is full", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch({
      playerLimit: 1, paidCount: 1, status: "closed",
    }));
    await expect(
      joinMatch({ matchId: ref.id, uid: "u3", name: "C", isAdmin: false }),
    ).rejects.toThrow(/full|closed/i);
  });
});

describeIfEmu("joinMatch with guest", () => {
  beforeEach(clearMatches);

  it("creates self + guest, +2 to count", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch());
    await joinMatch({
      matchId: ref.id, uid: "u1", name: "Alice", isAdmin: false, guestName: "Mr Guest",
    });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(2);

    const parts = await getDocs(collection(db, "matches", ref.id, "participants"));
    const guests = parts.docs.filter((d) => d.data().isGuest);
    expect(guests).toHaveLength(1);
    expect(guests[0].data().guestName).toBe("Mr Guest");
    expect(guests[0].data().paidByUid).toBe("u1");
  });

  it("rejects when only 1 slot remains and a guest is requested", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch({
      playerLimit: 12, paidCount: 11,
    }));
    await expect(
      joinMatch({ matchId: ref.id, uid: "u1", name: "A", isAdmin: false, guestName: "G" }),
    ).rejects.toThrow(/full/i);
  });
});
