import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1383: The "Most-hinted games" stats card (data-testid
 * `stats-most-hinted`) renders each row as an <li> whose first child is a
 * <span class="stats-most-hinted-rank"> carrying the 1-based rank numeral.
 * That class is the styling hook StatsPage.css uses to size and align the
 * leading rank column. Other tests pin the card's empty-state copy and the
 * row data-testid pattern, but no test pins the rank span's tagName +
 * `stats-most-hinted-rank` className + leading "1" text together. A
 * regression that swapped the tag (e.g. <em>) or dropped the class hook
 * would silently break the row layout while every data-shape assertion
 * stayed green. Seed a single hint count so row 0 renders, then assert
 * the rank span's tag, class hook, and rendered text.
 */
describe("StatsPage — most-hinted row rank class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1383: stats-most-hinted row 0 renders rank as <span> with stats-most-hinted-rank class and '1' text", () => {
    localStorage.setItem(
      "cards-hints-used",
      JSON.stringify({ klondike: 5 }),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    const row0 = within(card).getByTestId("stats-most-hinted-row-0");
    const rank = row0.querySelector("span.stats-most-hinted-rank");
    expect(rank).not.toBeNull();
    expect(rank?.tagName).toBe("SPAN");
    expect(rank?.textContent).toBe("1");
  });
});
