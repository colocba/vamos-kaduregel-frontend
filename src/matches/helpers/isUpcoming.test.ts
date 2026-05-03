import { Timestamp } from "firebase/firestore";
import { isUpcoming } from "./isUpcoming";

describe("isUpcoming", () => {
  it("true for a future timestamp", () => {
    const future = Timestamp.fromMillis(Date.now() + 60_000);
    expect(isUpcoming(future)).toBe(true);
  });
  it("false for a past timestamp", () => {
    const past = Timestamp.fromMillis(Date.now() - 60_000);
    expect(isUpcoming(past)).toBe(false);
  });
});
