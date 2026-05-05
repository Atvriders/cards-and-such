import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2472 — focused coverage of the Gameplay <section>'s exact element
// childElementCount. Mirrors W2463 (Appearance section). Existing tests
// pin the Gameplay section's tagName, className equality (W1790),
// absence of id/role/style (W2053/W2397/W2136), aria-labelledby (W1830),
// and data-section-open (W1733), but nothing asserts how many element
// children the section actually contains. By default (gameplay is in
// the initially-open set), the Gameplay card renders exactly two element
// children: the `<div class="settings-card-head">` (header + reset
// button) and the expanded body `<div id="settings-gameplay-body">`. A
// regression that added a stray sibling element (or dropped the body
// wrapper) would silently slip past every existing structural assertion.
describe("SettingsPage gameplay section childElementCount (W2472)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Gameplay <section> with exactly 2 element children", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const gameplaySection = screen.getByTestId("settings-section-gameplay");
    expect(gameplaySection.tagName).toBe("SECTION");
    expect(gameplaySection.childElementCount).toBe(2);
  });
});
