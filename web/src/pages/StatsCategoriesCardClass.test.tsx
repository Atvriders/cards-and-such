import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1936: StatsPage's "Top played" categories stats card (the bar-chart panel
 * exposed via data-testid="stats-categories") is rendered with the EXACT
 * className "stats-card stats-card--exportable" — no more, no less. Existing
 * tests cover adjacent contracts but none pin this exact-equality on the
 * card itself:
 *   - W1159 / W1203 only do `getByTestId("stats-categories")` to scope
 *     queries for the empty-copy / subtitle text — they never assert the
 *     card's own className.
 *   - W1878 (StatsCategoriesTitleClass) pins the inner h2 heading's bare
 *     className, not the card wrapper.
 *   - W1924 pins the SIBLING `stats-activity` card's exact className but
 *     deliberately scopes itself to that one testid.
 * The `stats-card--exportable` BEM modifier is the load-bearing CSS hook
 * that opts the categories card in to the shared "exportable" styling
 * (export-button positioning, hover affordance) shared with the other
 * exportable charts. A refactor that quietly drops the modifier, swaps the
 * order of the two classes, or appends a stray state class (e.g.
 * "is-empty" / "stats-card--bar") would silently drift the card's visual
 * contract while every other assertion still passed. Pin the exact-equality
 * className contract so any such regression fails fast.
 */
describe("StatsPage stats-categories card — exact className equality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1936: stats-categories card className equals exactly 'stats-card stats-card--exportable'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.className === "stats-card stats-card--exportable").toBe(true);
  });
});
