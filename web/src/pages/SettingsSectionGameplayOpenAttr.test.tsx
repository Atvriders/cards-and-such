import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1733 — focused coverage of the Gameplay <section>'s `data-section-open`
// attribute. Each of the four section cards renders a
// `data-section-open={isOpen(key) ? "true" : "false"}` attribute that the
// mobile-accordion CSS in SettingsPage.css uses to show/hide the body
// below 600px viewports. On the desktop default (jsdom matchMedia returns
// false-ish), `isOpen` evaluates to true for every section, so the
// attribute should render as the literal string "true" on the gameplay
// section. Existing tests pin the gameplay section's testid and its
// aria-labelledby, but nothing asserts the `data-section-open` attribute.
// A regression that dropped or renamed this attribute, or that flipped
// its default value, would silently break the mobile-accordion styling
// without tripping any existing assertion. Mirrors W1721 (audio).
describe("SettingsPage gameplay section data-section-open attribute (W1733)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Gameplay <section> with data-section-open="true" by default', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const gameplaySection = screen.getByTestId("settings-section-gameplay");
    expect(gameplaySection.tagName).toBe("SECTION");
    expect(gameplaySection.getAttribute("data-section-open")).toBe("true");
  });
});
