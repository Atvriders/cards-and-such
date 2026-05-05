import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2502 — Sibling-test partner to W1198 (head row aria-hidden + Mon..Sun
 * day labels), W1969 (head row tagName === "DIV"), and W1341 (head row
 * leading category-column spacer). The category × day-of-week heatmap's
 * head row is identified throughout the test suite by its
 * `.stats-heatmap-row--head` modifier class — every head-row pin
 * (W1198/W1341/W1969 here, plus the `*Dow*` and `*HeadCatSpacer*` tests)
 * locates it via `grid.querySelector(".stats-heatmap-row--head")` or
 * `r.classList.contains("stats-heatmap-row--head")`, both of which only
 * require the modifier TOKEN to be present and tolerate extra classes
 * silently being appended (e.g. `"stats-heatmap-row stats-heatmap-row--head
 * is-empty"` or a stateful flag like `"... stats-heatmap-row--has-data"`).
 *
 * The exact two-token className (`"stats-heatmap-row stats-heatmap-row--head"`)
 * is the contract that:
 *  - the row inherits the same base-row CSS layout as every data row (via
 *    the bare `.stats-heatmap-row` token), keeping the 1+7 grid columns
 *    aligned across head and body;
 *  - the row is uniquely distinguished from data rows by the `--head` BEM
 *    modifier (so head-only styling like reduced row-height or muted text
 *    can target it without touching data rows);
 *  - no third token (e.g. an `is-empty`/`is-loading` state class) leaks
 *    onto the head row — those would shift CSS specificity, open a new
 *    style-cascade surface, and could become a hook other code comes to
 *    depend on, all while every existing `classList.contains` /
 *    `querySelector` head-row check stays green.
 *
 * No existing test pins the head row's EXACT className equality; W1969
 * pins tagName, W1198 pins aria-hidden + dow labels, and W1341 pins the
 * leading spacer's structure. Pin the exact className so any extra-class
 * regression on the head row fails loudly here.
 */

function renderPage(): void {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <StatsPage />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe("StatsPage heatmap head row — exact className equality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2502: stats-cat-heatmap head row className equals exactly 'stats-heatmap-row stats-heatmap-row--head'", () => {
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    const headRow = grid.querySelector(".stats-heatmap-row--head") as HTMLElement | null;
    expect(headRow).not.toBeNull();
    // Sanity: still a DIV (mirrors W1969) so the equality assertion below
    // is anchored to the same element other head-row pins target.
    expect(headRow!.tagName).toBe("DIV");
    // Exact-equality pin — distinct from the `.classList.contains(...)` /
    // `querySelector(".stats-heatmap-row--head")` checks used elsewhere in
    // the suite; this fails if a refactor appends ANY additional class
    // token (state flags, layout variants, etc.) onto the head row.
    expect(headRow!.className).toBe("stats-heatmap-row stats-heatmap-row--head");
  });
});
