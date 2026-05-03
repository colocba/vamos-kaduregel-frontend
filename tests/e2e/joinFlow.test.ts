import { describe, it, expect, beforeEach } from "vitest";
import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";
import fs from "fs";
import path from "path";

const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
const describeIfEmu = useEmulators ? describe : describe.skip;

let env: RulesTestEnvironment;

beforeEach(async () => {
  if (!useEmulators) return;
  env = await initializeTestEnvironment({
    projectId: "e2e-join",
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, "../../firestore.rules"), "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    await c.firestore().collection("users").doc("u1").set({ isAdmin: false });
    await c.firestore().collection("matches").doc("m1").set({
      date: Timestamp.fromMillis(Date.now() + 60_000),
      location: "X",
      numFields: 1,
      playerLimit: 12,
      pricePerPlayer: 0,
      paymentLink: "",
      notes: "",
      status: "open",
      paidCount: 0,
      createdBy: "admin1",
      createdAt: Timestamp.now(),
    });
  });
});

describeIfEmu("e2e: regular user can join via transaction", () => {
  it("creates participant and increments count under rules", async () => {
    const u1 = env.authenticatedContext("u1");
    const fs1 = u1.firestore();
    await runTransaction(fs1 as never, async (tx) => {
      const matchSnap = await tx.get(doc(fs1 as never, "matches/m1"));
      const data = matchSnap.data() as { paidCount: number };
      tx.set(doc(fs1 as never, "matches/m1/participants/u1"), {
        paidByUid: "u1",
        paidByName: "U",
        isGuest: false,
        guestName: null,
        team: null,
        verified: false,
        verifiedBy: null,
        paidAt: serverTimestamp(),
      });
      tx.update(doc(fs1 as never, "matches/m1"), { paidCount: data.paidCount + 1 });
    });
    let after: { paidCount?: number } | undefined;
    await env.withSecurityRulesDisabled(async (c) => {
      const snap = await c.firestore().doc("matches/m1").get();
      after = snap.data() as { paidCount?: number } | undefined;
    });
    expect(after?.paidCount).toBe(1);
  });
});
