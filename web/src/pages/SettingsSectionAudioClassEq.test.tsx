import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1782 — focused coverage of the Audio <section>'s exact className value.
// Mirrors W1771 for Appearance. The four section cards share the
// `settings-card` base class, and only the data section additionally
// carries the `settings-card--data` BEM modifier (W1709). Existing tests
// pin the audio section's testid, its aria-labelledby, and its
// `data-section-open` attribute, but nothing asserts that the Audio
// section's className is the bare string "settings-card" — i.e. that no
// stray modifier has been bolted on (or that the data-only modifier hasn't
// accidentally leaked onto the audio card). A regression there would
// silently shift the Audio card's styling without tripping any existing
// assertion.
describe("SettingsPage audio section className equality (W1782)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Audio <section> with className exactly "settings-card"', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const audioSection = screen.getByTestId("settings-section-audio");
    expect(audioSection.tagName).toBe("SECTION");
    expect(audioSection.getAttribute("class")).toBe("settings-card");
  });
});
