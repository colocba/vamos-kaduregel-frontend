import { nextThursday } from "./nextThursday";

describe("nextThursday", () => {
  it("returns a Date that is a Thursday at 20:00 local", () => {
    const d = nextThursday(new Date("2026-05-03T10:00:00")); // a Sunday
    expect(d.getDay()).toBe(4); // Thursday
    expect(d.getHours()).toBe(20);
    expect(d.getMinutes()).toBe(0);
  });

  it("rolls to next Thursday if today is Thursday after 20:00", () => {
    const today = new Date("2026-05-07T21:00:00"); // Thursday 21:00
    const d = nextThursday(today);
    expect(d.getDay()).toBe(4);
    expect(d.getDate()).toBe(14); // next week
  });
});
