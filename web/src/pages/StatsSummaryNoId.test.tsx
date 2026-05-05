import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2069: StatsPage renders one or more `.stats-summary` containers — flat
 * grids of headline `.stat-card` counters that sit inside the top-level
 * "Activity" stats card (games played, total wins, total hints/undos,
 * total time, sessions). Sibling tests already cover this node from
 * several angles:
 *   - StatsSummaryContainerTag pins the `.stats-summary` tagName=DIV.
 *   - StatsActivityChildCount pins the parent Activity card's direct child
 *     count, which implicitly anchors the wrapper's ordinal position.
 *   - StatsCardsCount and the per-cell label/value tests pin counters
 *     INSIDE the wrapper.
 * However, no existing test pins the absence of an `id` attribute on the
 * `.stats-summary` element itself. Adding an `id` would create a stable
 * in-page anchor / DOM-query handle (e.g. for fragment links, ScrollSpy
 * targets, label-for relationships, or external scripts) that downstream
 * code could silently come to depend on, turning later removal into a
 * hidden breaking change. The current design routes all addressing
 * through `className` for styling (`.stats-summary` in StatsPage.css)
 * and through descendant `data-testid`s for tests, so the wrapper's
 * identity stays decoupled from any in-page anchor contract. Pin the
 * absence of an `id` so any future change that adds one is reviewed
 * deliberately.
 */
describe("StatsPage .stats-summary wrapper — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2069: .stats-summary inside stats-activity has no id attribute", () => {
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
    expect(summary!.hasAttribute("id")).toBe(false);
  });
});
