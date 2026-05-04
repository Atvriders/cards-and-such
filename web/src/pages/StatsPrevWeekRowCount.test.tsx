import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1627: StatsPage's `stats-this-week` card renders its prior-week baseline
 * <ul data-testid="stats-prev-week"> with EXACTLY three <li> rows — one
 * each for "Prior plays" (W1606), "Prior wins" (W1614), and "Prior avg
 * time" (W1621). The three-row count is load-bearing because the prev-week
 * list mirrors the current-week list (W1297 row count = 3) one-to-one so
 * each baseline row aligns visually beneath its live counterpart in the
 * comparison card.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM `--prev` modifier class (W1592), and each row's label copy
 * individually (W1606/W1614/W1621), but they assert `>= 2` or `>= 3`
 * rows — none locks the EXACT count. A regression that appended a fourth
 * baseline row (e.g. "Prior streak"), duplicated a row, or split a metric
 * across two rows would still satisfy every existing assertion while
 * silently breaking the side-by-side row alignment with the current-week
 * list. This test pins the exact <li> child count at 3.
 */
describe("StatsPage stats-this-week — prev-week list row count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1627: stats-prev-week <ul> contains exactly three <li> rows", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    // Strict equality — not >= 3. The prev-week list must mirror the
    // current-week list one-to-one (plays / wins / avg time).
    const rows = prior.querySelectorAll("li");
    expect(rows.length).toBe(3);
  });
});
