import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2352 — focused coverage of the Appearance <section>'s lack of a
// `tabindex` attribute. A non-interactive landmark <section> should not
// participate in the tab order; the only focusable element inside the
// section's head is the toggle <button>. Existing tests pin the section's
// tagName, exact className, missing `id`/`style`, `aria-labelledby`, and
// `data-section-open` value, but none assert the absence of `tabindex`.
// A regression that added `tabindex="0"` (or any value) to the section
// would silently expand the focus order and slip past every existing
// assertion.
describe("SettingsPage appearance section has no tabindex attribute (W2352)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Appearance <section> without a tabindex attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const appearanceSection = screen.getByTestId("settings-section-appearance");
    expect(appearanceSection.tagName).toBe("SECTION");
    expect(appearanceSection.hasAttribute("tabindex")).toBe(false);
    expect(appearanceSection.hasAttribute("tabIndex")).toBe(false);
  });
});
