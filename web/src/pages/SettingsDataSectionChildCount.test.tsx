import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2477 — focused coverage of the Data <section>'s exact element
// childElementCount. Mirrors W2463 (Appearance childElementCount) and
// W2474 (Audio childElementCount). Existing tests pin the section's
// tagName, className equality (W1800), modifier class, absence of
// id/style/tabindex (W2044-equivalent / W2135-equivalent / W2405),
// aria-labelledby, and data-section-open, but nothing asserts how many
// element children the section actually contains. By default
// (desktop / non-mobile, no localStorage override), the Data card
// renders exactly two element children: the
// `<div class="settings-card-head">` (toggle button wrapper) and the
// expanded body `<div id="settings-data-body">`. A regression that added
// a stray sibling element (or dropped the body wrapper) would silently
// slip past every existing structural assertion.
describe("SettingsPage data section childElementCount (W2477)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Data <section> with exactly 2 element children", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const dataSection = screen.getByTestId("settings-section-data");
    expect(dataSection.tagName).toBe("SECTION");
    expect(dataSection.childElementCount).toBe(2);
  });
});
