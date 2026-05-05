import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2474 — focused coverage of the Audio <section>'s exact element
// childElementCount. Mirrors W2463 (Appearance childElementCount). Existing
// tests pin the section's tagName, className equality (W1782), absence of
// id/style/role (W2045/W2134/W2362), aria-labelledby (W1820), and
// data-section-open (W1721), but nothing asserts how many element children
// the section actually contains. By default (desktop / non-mobile, no
// localStorage override), the Audio card renders exactly two element
// children: the `<div class="settings-card-head">` (header + reset button)
// and the expanded body `<div id="settings-audio-body">`. A regression that
// added a stray sibling element (or dropped the body wrapper) would silently
// slip past every existing structural assertion.
describe("SettingsPage audio section childElementCount (W2474)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Audio <section> with exactly 2 element children", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const audioSection = screen.getByTestId("settings-section-audio");
    expect(audioSection.tagName).toBe("SECTION");
    expect(audioSection.childElementCount).toBe(2);
  });
});
