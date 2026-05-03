import { directionFor, syncHtmlDirAndLang } from "./direction";

describe("directionFor", () => {
  it("returns rtl for he", () => expect(directionFor("he")).toBe("rtl"));
  it("returns ltr for es", () => expect(directionFor("es")).toBe("ltr"));
  it("returns ltr for en", () => expect(directionFor("en")).toBe("ltr"));
});

describe("syncHtmlDirAndLang", () => {
  it("sets dir=rtl and lang=he", () => {
    syncHtmlDirAndLang("he");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("he");
  });

  it("sets dir=ltr and lang=en", () => {
    syncHtmlDirAndLang("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
  });
});
