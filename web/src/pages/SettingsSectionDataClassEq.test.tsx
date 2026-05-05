import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1800 — focused coverage of the Data <section>'s exact className value.
// The four section cards share the `settings-card` base class; the data
// section additionally carries the `settings-card--data` BEM modifier
// (W1709). W1771/W1782/W1790 pin the bare `settings-card` string for the
// Appearance/Audio/Gameplay sections respectively, but nothing asserts
// the *exact* class string for the Data section — only that the modifier
// is present (W1709). A regression that accidentally bolted on a stray
// modifier (or dropped/renamed the base or `--data` modifier) would
// silently shift the Data card's styling without tripping any existing
// assertion.
describe("SettingsPage data section className equality (W1800)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Data <section> with className exactly "settings-card settings-card--data"', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const dataSection = screen.getByTestId("settings-section-data");
    expect(dataSection.tagName).toBe("SECTION");
    expect(dataSection.getAttribute("class")).toBe(
      "settings-card settings-card--data",
    );
  });
});
