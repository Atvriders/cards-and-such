import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1830 — focused coverage of the Gameplay <section>'s `aria-labelledby`
// attribute. Mirror of W1810 (Appearance) and W1820 (Audio) for the Gameplay
// card. Each of the four settings section cards points its `aria-labelledby`
// at the heading id rendered inside the section toggle (e.g.
// "settings-gameplay-heading"), so screen readers announce the section's name
// when entering it. W899 pins the resolved region name via getByRole; this
// test pins the literal attribute string + heading-id presence so a
// regression that dropped, renamed, or mismatched the heading id (e.g. typo
// to "settings-gamplay-heading") still trips even if the role-based name
// resolution coincidentally still matches.
describe("SettingsPage gameplay section aria-labelledby attribute (W1830)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Gameplay <section> with aria-labelledby="settings-gameplay-heading"', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const gameplaySection = screen.getByTestId("settings-section-gameplay");
    expect(gameplaySection.tagName).toBe("SECTION");
    expect(gameplaySection.getAttribute("aria-labelledby")).toBe(
      "settings-gameplay-heading",
    );
    // The referenced heading must actually exist inside the section so the
    // accessible name resolves correctly.
    const heading = gameplaySection.querySelector("#settings-gameplay-heading");
    expect(heading).not.toBeNull();
  });
});
