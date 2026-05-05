import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1790 — focused coverage of the Gameplay <section>'s exact className
// value. Mirrors W1771 (Appearance) and W1782 (Audio). The four section
// cards share the `settings-card` base class, and only the data section
// additionally carries the `settings-card--data` BEM modifier (W1709).
// Existing tests pin the gameplay section's testid, its aria-labelledby,
// and its `data-section-open` attribute (W1733), but nothing asserts that
// the Gameplay section's className is the bare string "settings-card" —
// i.e. that no stray modifier has been bolted on (or that the data-only
// modifier hasn't accidentally leaked onto the gameplay card). A
// regression there would silently shift the Gameplay card's styling
// without tripping any existing assertion.
describe("SettingsPage gameplay section className equality (W1790)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Gameplay <section> with className exactly "settings-card"', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const gameplaySection = screen.getByTestId("settings-section-gameplay");
    expect(gameplaySection.tagName).toBe("SECTION");
    expect(gameplaySection.getAttribute("class")).toBe("settings-card");
  });
});
