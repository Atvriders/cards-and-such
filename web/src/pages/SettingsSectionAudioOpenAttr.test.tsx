import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1721 — focused coverage of the Audio <section>'s `data-section-open`
// attribute. Each of the four section cards renders a
// `data-section-open={isOpen(key) ? "true" : "false"}` attribute that the
// mobile-accordion CSS in SettingsPage.css uses to show/hide the body
// below 600px viewports. On the desktop default (jsdom matchMedia returns
// false-ish), `isOpen` evaluates to true for every section, so the
// attribute should render as the literal string "true" on the audio
// section. Existing tests pin the audio section's testid, its
// aria-labelledby (W909), and its aria-controls toggle wiring, but
// nothing asserts the `data-section-open` attribute. A regression that
// dropped or renamed this attribute, or that flipped its default value,
// would silently break the mobile-accordion styling without tripping any
// existing assertion.
describe("SettingsPage audio section data-section-open attribute (W1721)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Audio <section> with data-section-open="true" by default', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const audioSection = screen.getByTestId("settings-section-audio");
    expect(audioSection.tagName).toBe("SECTION");
    expect(audioSection.getAttribute("data-section-open")).toBe("true");
  });
});
