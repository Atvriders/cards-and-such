import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1810 — focused coverage of the Appearance <section>'s `aria-labelledby`
// attribute. Each of the four settings section cards points its
// `aria-labelledby` at the heading id rendered inside the section toggle
// (e.g. "settings-appearance-heading"), so screen readers announce the
// section's name when entering it. Existing tests pin the testid, the
// `data-section-open` attribute, and the className equality, but nothing
// asserts the actual value of `aria-labelledby`. A regression that
// dropped, renamed, or mismatched the heading id (e.g. typo to
// "settings-apperance-heading") would silently break the section's
// accessible name without tripping any existing assertion.
describe("SettingsPage appearance section aria-labelledby attribute (W1810)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Appearance <section> with aria-labelledby="settings-appearance-heading"', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const appearanceSection = screen.getByTestId("settings-section-appearance");
    expect(appearanceSection.tagName).toBe("SECTION");
    expect(appearanceSection.getAttribute("aria-labelledby")).toBe(
      "settings-appearance-heading",
    );
    // The referenced heading must actually exist inside the section so the
    // accessible name resolves correctly.
    const heading = appearanceSection.querySelector(
      "#settings-appearance-heading",
    );
    expect(heading).not.toBeNull();
  });
});
