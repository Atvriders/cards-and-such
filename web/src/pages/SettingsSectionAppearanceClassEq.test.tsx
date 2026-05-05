import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1771 — focused coverage of the Appearance <section>'s exact className
// value. The four section cards share the `settings-card` base class, and
// the data section additionally carries the `settings-card--data` BEM
// modifier (W1709). Existing tests pin the appearance section's testid,
// its aria-labelledby, its `data-section-open` attribute (W1743), and the
// data section's modifier class, but nothing asserts that the Appearance
// section's className is the bare string "settings-card" — i.e. that no
// stray modifier has been bolted on. A regression that accidentally added
// a modifier (or dropped the base class) would silently shift the
// Appearance card's styling without tripping any existing assertion.
describe("SettingsPage appearance section className equality (W1771)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Appearance <section> with className exactly "settings-card"', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const appearanceSection = screen.getByTestId("settings-section-appearance");
    expect(appearanceSection.tagName).toBe("SECTION");
    expect(appearanceSection.getAttribute("class")).toBe("settings-card");
  });
});
