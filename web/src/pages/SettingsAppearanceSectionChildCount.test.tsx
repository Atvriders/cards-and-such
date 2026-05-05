import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2463 — focused coverage of the Appearance <section>'s exact element
// childElementCount. Existing tests pin the section's tagName (W1844),
// className equality (W1655 / W1771), absence of id/style/tabindex
// (W2044/W2135/W2352), aria-labelledby (W1810), and data-section-open
// (W1743), but nothing asserts how many element children the section
// actually contains. By default (desktop / non-mobile, no localStorage
// override), the Appearance card renders exactly two element children:
// the `<div class="settings-card-head">` (header + reset button) and the
// expanded body `<div id="settings-appearance-body">`. A regression that
// added a stray sibling element (or dropped the body wrapper) would
// silently slip past every existing structural assertion.
describe("SettingsPage appearance section childElementCount (W2463)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Appearance <section> with exactly 2 element children", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const appearanceSection = screen.getByTestId("settings-section-appearance");
    expect(appearanceSection.tagName).toBe("SECTION");
    expect(appearanceSection.childElementCount).toBe(2);
  });
});
