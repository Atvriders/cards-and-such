import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1333: The "Personal records by category" card renders its row list
 * inside a <ul> carrying both the shared `stats-pr-list` class (so it
 * inherits the same base PR-list styling as the sibling top-10
 * "Personal records" card) AND the `stats-pr-list--by-cat` BEM
 * modifier. The modifier is the styling hook the StatsPage CSS uses
 * to apply by-category-specific layout — including the empty-row
 * dimming for `li[data-empty="true"]` selectors and the per-category
 * rank-column sizing — so dropping the modifier would silently
 * regress every visual rule scoped under `.stats-pr-list--by-cat`
 * in StatsPage.css while every data-shape test continues to pass.
 *
 * Existing coverage pins the card's subtitle (W1296) and the
 * one-PR-per-category row mapping (W635), and the sibling top-10
 * card has its rank-class pinned (W1308) — but no test pins the
 * by-cat list's modifier class. This test pins exactly that.
 */
describe("StatsPage — personal records by category list class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1333: stats-personal-records-by-category renders <ul> with both stats-pr-list and stats-pr-list--by-cat classes", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records-by-category");
    const list = within(card).getByRole("list");
    expect(list.tagName).toBe("UL");
    expect(list.classList.contains("stats-pr-list")).toBe(true);
    expect(list.classList.contains("stats-pr-list--by-cat")).toBe(true);
  });
});
