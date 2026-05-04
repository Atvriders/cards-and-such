import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1308: The "Personal records" stats card (data-testid
 * `stats-personal-records`) renders each best-times row as an <li> with
 * four spans: rank, title, time, and date. The leading rank span uses
 * the `stats-pr-rank` className, which is the styling hook the
 * StatsPage.css uses to size and align the 1-based rank numeral as the
 * row's leftmost column. Existing coverage of these rows pins the row
 * sort order (W768), the cap-at-10 slice (W786), the corruption-filter
 * fallback (assertions on data-testid) and the "no best times" empty
 * copy (W1145), but no test pins the rank span's `stats-pr-rank` class
 * hook itself. A regression that dropped the className (or renamed it)
 * would silently break the row layout while every data-shape assertion
 * stayed green. Seed a single best-time so the first row renders, then
 * assert the rank span carries `stats-pr-rank` and the visible "1".
 */
describe("StatsPage — personal records row rank class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1308: stats-personal-records row 0 renders rank span with stats-pr-rank class and '1' text", () => {
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ klondike: 90 }),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    const row0 = within(card).getByTestId("stats-pr-row-0");
    // The rank span is the row's first <span> child — pin its class
    // hook and its 1-based rank text.
    const rank = row0.querySelector("span.stats-pr-rank");
    expect(rank).not.toBeNull();
    expect(rank?.tagName).toBe("SPAN");
    expect(rank?.textContent).toBe("1");
  });
});
