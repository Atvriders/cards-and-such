import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2415: Each row in the "Personal records by category" list is rendered
 * with a `data-testid="stats-pr-cat-<cat>"` hook so tests can locate the
 * per-category record entry. Existing coverage pins the row's textContent
 * (W635) and the `data-empty` flag for untouched categories, plus the
 * card container tagName (W1954) and the list's class modifier (W1333) —
 * but nothing pins the row element type. A refactor that swapped the
 * per-category record row from <li> to a <div> or <tr> would silently
 * break the semantic ul/li relationship while every existing assertion
 * (which only inspects textContent + data-empty) continues to pass.
 * Pin the tagName so the contract is enforced.
 */
describe("StatsPage — personal records by category row tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2415: stats-pr-cat-<cat> row container is an <li>", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Categories render unconditionally from CATEGORY_FILTERS even with
    // no seeded best-times (untouched categories show data-empty="true").
    const row = screen.getByTestId("stats-pr-cat-solitaire");
    expect(row.tagName).toBe("LI");
  });
});
