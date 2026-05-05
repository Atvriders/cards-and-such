import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2142: StatsPage renders multiple section-level `<h2>` headings — "Activity",
 * "Records", "Top played", "Plays by hour of day", "Plays by category × day-of-week",
 * "This week", "Personal records", "Personal records by category",
 * "Most-hinted games", "Replays", and "Achievements". W2092 pins the contract
 * that no StatsPage h2 carries an `id` attribute; this test mirrors that
 * contract on the OTHER classic visual-bypass attribute: `style`. All section
 * styling on StatsPage is delivered via stylesheet classes (e.g. card / panel
 * titles styled by their parent), never via inline `style=` strings on the
 * heading itself. An ad-hoc inline style on a section h2 (e.g.
 * `style={{ color: "red" }}` to draw attention to a hot section, or
 * `style={{ marginTop: 0 }}` to nudge spacing) would silently bypass theme
 * tokens, dark-mode rules, print styles, and the global typographic scale —
 * and would not be caught by class-based regression tests. Pin the absence
 * of an inline `style` attribute on EVERY StatsPage h2 so any future change
 * that introduces one is a deliberate, test-acknowledged contract change.
 */
describe("StatsPage section headings — every h2 has no style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2142: every <h2> on StatsPage renders with no style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const h2s = document.querySelectorAll("h2");
    expect(h2s.length).toBeGreaterThan(0);
    h2s.forEach((h2) => {
      expect(h2.hasAttribute("style")).toBe(false);
    });
  });
});
