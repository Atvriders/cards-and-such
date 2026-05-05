import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2103: StatsPage renders `.stats-summary` containers — flat grids of
 * headline `.stat-card` counters inside the top-level "Activity" stats
 * card. Sibling tests pin its tagName (DIV), its absence of an `id`,
 * its parent card's child count, and its descendant counters. No
 * existing test pins the absence of an inline `style` attribute on the
 * `.stats-summary` element itself. Adding an inline `style` would
 * silently override the cascade defined by `.stats-summary` in
 * StatsPage.css (grid layout, gap, spacing) and bypass the design
 * tokens / responsive rules expressed there, creating drift between
 * theme and one-off local overrides. The current design routes all
 * presentation through the stylesheet via `className`, with no inline
 * style escape hatch on this wrapper. Pin the absence of a `style`
 * attribute so any future change that introduces inline styling is
 * reviewed deliberately.
 */
describe("StatsPage .stats-summary wrapper — style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2103: .stats-summary inside stats-activity has no style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    const summary = card.querySelector(".stats-summary");
    expect(summary).not.toBeNull();
    expect(summary!.hasAttribute("style")).toBe(false);
  });
});
