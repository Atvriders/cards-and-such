import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2044 — focused coverage of the Appearance <section>'s lack of an `id`
// attribute. The Appearance section is identified to assistive tech via
// `aria-labelledby="settings-appearance-heading"` (the heading itself owns
// the `id`), and is queried in tests via `data-testid`. The section element
// itself intentionally has no `id` attribute. Existing tests pin the
// section's testid, aria-labelledby target, exact className, and
// `data-section-open` attribute, but nothing asserts that the section
// element does NOT carry an `id`. A regression that added an `id` to the
// section (which would duplicate or conflict with the heading's id, and
// could change CSS specificity / fragment-link behavior) would slip past
// every existing assertion.
describe("SettingsPage appearance section has no id attribute (W2044)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Appearance <section> without an id attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const appearanceSection = screen.getByTestId("settings-section-appearance");
    expect(appearanceSection.tagName).toBe("SECTION");
    expect(appearanceSection.hasAttribute("id")).toBe(false);
  });
});
