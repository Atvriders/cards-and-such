import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1820 — focused coverage of the Audio <section>'s `aria-labelledby`
// attribute. Mirror of W1810 (Appearance) for the Audio card. Each of the
// four settings section cards points its `aria-labelledby` at the heading id
// rendered inside the section toggle (e.g. "settings-audio-heading"), so
// screen readers announce the section's name when entering it. W909 pins the
// resolved region name via getByRole; this test pins the literal attribute
// string + heading-id presence so a regression that dropped, renamed, or
// mismatched the heading id (e.g. typo to "settings-aduio-heading") still
// trips even if the role-based name resolution coincidentally still matches.
describe("SettingsPage audio section aria-labelledby attribute (W1820)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Audio <section> with aria-labelledby="settings-audio-heading"', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const audioSection = screen.getByTestId("settings-section-audio");
    expect(audioSection.tagName).toBe("SECTION");
    expect(audioSection.getAttribute("aria-labelledby")).toBe(
      "settings-audio-heading",
    );
    // The referenced heading must actually exist inside the section so the
    // accessible name resolves correctly.
    const heading = audioSection.querySelector("#settings-audio-heading");
    expect(heading).not.toBeNull();
  });
});
