import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1831 — focused coverage of the Data <section>'s `aria-labelledby`
// attribute. Final mirror of W1810 (Appearance), W1820 (Audio), and W1830
// (Gameplay) for the "Your data" card. Each of the four settings section
// cards points its `aria-labelledby` at the heading id rendered inside the
// section toggle (e.g. "settings-data-heading"), so screen readers announce
// the section's name when entering it. Existing Data tests pin the testid,
// the `data-section-open` attribute, the className equality, the modifier
// class, and the resolved region name via `getByRole("region", { name:
// "Your data" })`, but nothing asserts the literal value of the
// `aria-labelledby` attribute. A regression that dropped, renamed, or
// mismatched the heading id (e.g. typo to "settings-data-headig") would
// silently break the underlying landmark wiring even when the role-based
// name resolution coincidentally still matched.
describe("SettingsPage data section aria-labelledby attribute (W1831)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Data <section> with aria-labelledby="settings-data-heading"', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const dataSection = screen.getByTestId("settings-section-data");
    expect(dataSection.tagName).toBe("SECTION");
    expect(dataSection.getAttribute("aria-labelledby")).toBe(
      "settings-data-heading",
    );
    // The referenced heading must actually exist inside the section so the
    // accessible name resolves correctly.
    const heading = dataSection.querySelector("#settings-data-heading");
    expect(heading).not.toBeNull();
  });
});
