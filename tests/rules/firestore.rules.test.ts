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
