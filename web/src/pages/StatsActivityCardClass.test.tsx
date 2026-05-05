import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1924: StatsPage's "Activity" stats card (the line-chart panel exposed via
 * data-testid="stats-activity") is rendered with the EXACT className
 * "stats-card stats-card--exportable" — no more, no less. Existing tests
 * cover adjacent contracts but none pin this exact-equality on the card
 * itself:
 *   - W451 only checks `classList.contains("stats-card")` (tolerates extra
 *     classes being appended).
 *   - W1235/W1918 pin the parent `.stats-card-grid` SECTION wrapper, not
 *     the activity card.
 *   - W1850 pins the card's tagName=DIV, not its className.
 *   - W1263/W1884 pin the inner h2 heading parent + bare className.
 * The `stats-card--exportable` BEM modifier is the load-bearing CSS hook
 * that opts the card in to the shared "exportable" styling (export button
 * positioning, hover affordance) shared with the other exportable charts.
 * A refactor that quietly drops the modifier, swaps the order, or appends
 * a stray state class (e.g. "is-empty") would silently drift the card's
 * visual contract while every other assertion still passed. Pin the
 * exact-equality className contract so any such regression fails fast.
 */
describe("StatsPage stats-activity card — exact className equality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1924: stats-activity card className equals exactly 'stats-card stats-card--exportable'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    expect(card.className === "stats-card stats-card--exportable").toBe(true);
  });
});
