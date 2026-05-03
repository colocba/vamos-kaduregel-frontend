import { deriveLimit } from "./deriveLimit";
describe("deriveLimit", () => {
  it("12 for one field", () => expect(deriveLimit(1)).toBe(12));
  it("24 for two fields", () => expect(deriveLimit(2)).toBe(24));
});
