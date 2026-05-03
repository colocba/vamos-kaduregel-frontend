import { render, screen } from "@testing-library/react";
import App from "./App";
import "./i18n";
import { APP_NAME } from "./constants";

describe("App", () => {
  it("renders the app name in the header", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: APP_NAME })).toBeInTheDocument();
  });
});
