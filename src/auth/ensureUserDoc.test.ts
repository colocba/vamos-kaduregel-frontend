import { describe, it, expect, beforeEach } from "vitest";
import type { User } from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { connectEmulatorsOnce } from "../firebase/emulator";
import { db } from "../firebase/client";
import { ensureUserDoc } from "./ensureUserDoc";

// These tests need the Firestore + Auth emulators running. Run them via
// `npm run test:emu` (requires Java + firebase-tools). When CI is set up,
// it MUST run `test:emu` against the emulator — otherwise this suite
// silently skips and the no-overwrite contract goes unverified.
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
const describeIfEmu = useEmulators ? describe : describe.skip;

if (useEmulators) {
  connectEmulatorsOnce();
}

const fakeUser = {
  uid: "test-uid-1",
  displayName: "Test Player",
  email: "test@example.com",
  photoURL: "https://example.com/p.png",
} as unknown as User;

describeIfEmu("ensureUserDoc", () => {
  beforeEach(async () => {
    await deleteDoc(doc(db, "users", fakeUser.uid)).catch(() => {});
  });

  it("creates a user doc when one does not exist", async () => {
    await ensureUserDoc(fakeUser, "es");
    const snap = await getDoc(doc(db, "users", fakeUser.uid));
    expect(snap.exists()).toBe(true);
    expect(snap.data()?.displayName).toBe("Test Player");
    expect(snap.data()?.locale).toBe("es");
    expect(snap.data()?.isAdmin).toBe(false);
  });

  it("does not overwrite an existing user doc", async () => {
    await ensureUserDoc(fakeUser, "es");
    await ensureUserDoc({ ...fakeUser, displayName: "Renamed" } as User, "en");
    const snap = await getDoc(doc(db, "users", fakeUser.uid));
    expect(snap.data()?.displayName).toBe("Test Player");
    expect(snap.data()?.locale).toBe("es");
  });
});
