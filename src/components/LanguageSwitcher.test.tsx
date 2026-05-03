import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "../i18n";
import { DEFAULT_LOCALE } from "../constants";
import { AuthContext } from "../auth/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

afterEach(() => {
  i18n.changeLanguage(DEFAULT_LOCALE);
});

describe("LanguageSwitcher", () => {
  it("changes the active language when an option is selected", async () => {
    render(
      <AuthContext.Provider value={{ status: "signedOut" }}>
        <LanguageSwitcher />
      </AuthContext.Provider>,
    );
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "es");
    expect(i18n.language).toBe("es");
  });
});
