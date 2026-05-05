import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1753 — focused coverage of the Data <section>'s `data-section-open`
// attribute. Each of the four section cards renders a
// `data-section-open={isOpen(key) ? "true" : "false"}` attribute that the
// mobile-accordion CSS in SettingsPage.css uses to show/hide the body
// below 600px viewports. On the desktop default (jsdom matchMedia returns
// false-ish), `isOpen` evaluates to true for every section, so the
// attribute should render as the literal string "true" on the data
// section. Existing tests pin the data section's testid and its
// aria-labelledby, but nothing asserts the `data-section-open` attribute.
// A regression that dropped or renamed this attribute, or that flipped
// its default value, would silently break the mobile-accordion styling
// without tripping any existing assertion. Mirrors W1721 (audio),
// W1733 (gameplay), and W1743 (appearance).
describe("SettingsPage data section data-section-open attribute (W1753)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Data <section> with data-section-open="true" by default', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const dataSection = screen.getByTestId("settings-section-data");
    expect(dataSection.tagName).toBe("SECTION");
    expect(dataSection.getAttribute("data-section-open")).toBe("true");
  });
});
