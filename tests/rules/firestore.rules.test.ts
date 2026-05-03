import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import fs from "fs";
import path from "path";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";

const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
const describeIfEmu = useEmulators ? describe : describe.skip;

let env: RulesTestEnvironment;

beforeAll(async () => {
  if (!useEmulators) return;
  env = await initializeTestEnvironment({
    projectId: "rules-test",
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, "../../firestore.rules"), "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
});

afterAll(async () => {
  if (!useEmulators) return;
  await env.cleanup();
});

beforeEach(async () => {
  if (!useEmulators) return;
  await env.clearFirestore();
});

describeIfEmu("users rules", () => {
  it("allows self-create with isAdmin=false", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(
      ctx.firestore().collection("users").doc("u1").set({
        displayName: "A",
        email: "a@b.c",
        photoURL: "",
        isAdmin: false,
        locale: "he",
      }),
    );
  });

  it("blocks self-create with isAdmin=true", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertFails(
      ctx.firestore().collection("users").doc("u1").set({
        displayName: "A",
        email: "a@b.c",
        photoURL: "",
        isAdmin: true,
        locale: "he",
      }),
    );
  });

  it("allows self-update of locale only", async () => {
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().collection("users").doc("u1").set({
        displayName: "A",
        email: "a@b.c",
        photoURL: "",
        isAdmin: false,
        locale: "he",
      }),
    );
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(ctx.firestore().collection("users").doc("u1").update({ locale: "en" }));
    await assertFails(ctx.firestore().collection("users").doc("u1").update({ isAdmin: true }));
  });

  it("admin can toggle isAdmin on others", async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await c.firestore().collection("users").doc("admin1").set({ isAdmin: true });
      await c.firestore().collection("users").doc("u2").set({ isAdmin: false });
    });
    const adminCtx = env.authenticatedContext("admin1");
    await assertSucceeds(
      adminCtx.firestore().collection("users").doc("u2").update({ isAdmin: true }),
    );
  });
});

describeIfEmu("matches rules", () => {
  it("any signed-in user can read matches", async () => {
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().collection("matches").doc("m1").set({ status: "open" }),
    );
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(ctx.firestore().collection("matches").doc("m1").get());
  });

  it("non-admins cannot create matches", async () => {
    const ctx = env.authenticatedContext("u1");
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().collection("users").doc("u1").set({ isAdmin: false }),
    );
    await assertFails(ctx.firestore().collection("matches").doc("m1").set({ status: "open" }));
  });

  it("admin can create matches", async () => {
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().collection("users").doc("admin1").set({ isAdmin: true }),
    );
    const ctx = env.authenticatedContext("admin1");
    await assertSucceeds(
      ctx.firestore().collection("matches").doc("m1").set({ status: "open" }),
    );
  });
});

describeIfEmu("participants rules", () => {
  beforeEach(async () => {
    if (!useEmulators) return;
    await env.withSecurityRulesDisabled(async (c) => {
      await c.firestore().collection("matches").doc("m1").set({ status: "open" });
      await c.firestore().collection("users").doc("admin1").set({ isAdmin: true });
      await c.firestore().collection("users").doc("u1").set({ isAdmin: false });
    });
  });

  it("user can create their own self-entry at doc id == uid", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(
      ctx.firestore().collection("matches").doc("m1").collection("participants").doc("u1").set({
        paidByUid: "u1",
        paidByName: "U",
        isGuest: false,
        guestName: null,
        team: null,
        verified: false,
        verifiedBy: null,
        paidAt: new Date(),
      }),
    );
  });

  it("user cannot create a self-entry at someone else's uid", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertFails(
      ctx.firestore().collection("matches").doc("m1").collection("participants").doc("other").set({
        paidByUid: "u1",
        paidByName: "U",
        isGuest: false,
        guestName: null,
        team: null,
        verified: false,
        verifiedBy: null,
        paidAt: new Date(),
      }),
    );
  });

  it("user can create a guest entry", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(
      ctx.firestore().collection("matches").doc("m1").collection("participants").doc("g1").set({
        paidByUid: "u1",
        paidByName: "U",
        isGuest: true,
        guestName: "Bob",
        team: null,
        verified: false,
        verifiedBy: null,
        paidAt: new Date(),
      }),
    );
  });

  it("user can delete their own entry, not someone else's", async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await c.firestore().doc("matches/m1/participants/u1").set({ paidByUid: "u1" });
      await c.firestore().doc("matches/m1/participants/u2").set({ paidByUid: "u2" });
    });
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(ctx.firestore().doc("matches/m1/participants/u1").delete());
    await assertFails(ctx.firestore().doc("matches/m1/participants/u2").delete());
  });

  it("admin can delete anyone", async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await c.firestore().doc("matches/m1/participants/u9").set({ paidByUid: "u9" });
    });
    const ctx = env.authenticatedContext("admin1");
    await assertSucceeds(ctx.firestore().doc("matches/m1/participants/u9").delete());
  });

  it("only admins can verify (update)", async () => {
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().doc("matches/m1/participants/u1").set({ paidByUid: "u1", verified: false }),
    );
    const userCtx = env.authenticatedContext("u1");
    const adminCtx = env.authenticatedContext("admin1");
    await assertFails(
      userCtx.firestore().doc("matches/m1/participants/u1").update({ verified: true }),
    );
    await assertSucceeds(
      adminCtx.firestore().doc("matches/m1/participants/u1").update({ verified: true }),
    );
  });
});
