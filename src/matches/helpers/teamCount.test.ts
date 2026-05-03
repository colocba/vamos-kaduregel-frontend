import { teamCount } from "./teamCount";
describe("teamCount", () => {
  it("2 for one field", () => expect(teamCount(1)).toBe(2));
  it("4 for two fields", () => expect(teamCount(2)).toBe(4));
});
