import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1592: StatsPage's `stats-this-week` card renders its prior-week metric
 * list as
 *   <ul className="stats-week-list stats-week-list--prev"
 *       data-testid="stats-prev-week">
 * The `--prev` BEM modifier is the styling hook the CSS uses to dim / tone
 * down the prior-week block so it reads as a baseline rather than a primary
 * row (smaller type, muted color, no delta chips). Existing prev-week tests
 * pin the testid and assert text content, but none lock the modifier class —
 * so a regression that drops `stats-week-list--prev` (or renames it) would
 * leave every other test green while the visual hierarchy of the comparison
 * card silently inverts.
 */
describe("StatsPage stats-this-week — prev-week list modifier className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1592: stats-prev-week <ul> carries the stats-week-list--prev modifier class", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    // Base class is shared with the current-week list, but the modifier
    // is what makes the prior-week block render as a muted baseline.
    expect(prior).toHaveClass("stats-week-list");
    expect(prior).toHaveClass("stats-week-list--prev");
  });
});
