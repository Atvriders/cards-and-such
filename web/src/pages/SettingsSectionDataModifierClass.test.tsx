import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1709 — focused coverage of the "Your data" <section>'s modifier class.
// Unlike the other three section cards (Appearance, Audio, Gameplay) which
// render `<section className="settings-card">`, the data section renders
// `<section className="settings-card settings-card--data">` — that extra
// `settings-card--data` BEM modifier is what SettingsPage.css uses to
// differentiate the data card's destructive-action styling from the
// vanilla setting cards. Existing tests pin the data section's testid,
// its aria-labelledby (W919), and its aria-controls toggle wiring, but
// nothing asserts the modifier class on the section itself. A regression
// that dropped or renamed `settings-card--data` would silently break
// the data card's distinct styling without tripping any assertion.
describe("SettingsPage data section modifier class (W1709)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the data <section> with the settings-card--data modifier class", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const dataSection = screen.getByTestId("settings-section-data");
    expect(dataSection.tagName).toBe("SECTION");
    expect(dataSection).toHaveClass("settings-card");
    expect(dataSection).toHaveClass("settings-card--data");
  });
});
