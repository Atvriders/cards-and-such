import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1341 — Sibling-test partner to W1198 (head row aria-hidden + Mon..Sun
 * day labels) and W1210 (data row category labels). The heatmap's head
 * row is laid out as a 1+7 CSS grid: a leading empty `.stats-heatmap-cat`
 * span acting as the gutter spacer above the data rows' category-label
 * column, followed by the seven `.stats-heatmap-dow` day labels. Without
 * that empty leading span the day labels misalign one column to the left
 * — "Mon" sits over the category-label gutter and "Sun" overhangs the
 * grid — which silently breaks the visual day-of-week mapping for every
 * cell below. W1198 pins the seven `.stats-heatmap-dow` labels and the
 * row's `aria-hidden`, but no test pins the leading spacer's existence,
 * its empty text content, or that it precedes the day labels in DOM
 * order. A refactor that drops the spacer (e.g. switching to a
 * `grid-template-columns: subgrid` model and removing the `<span/>`) or
 * accidentally fills it with text (e.g. a literal "Category" header that
 * would then be announced despite the row's aria-hidden being applied at
 * the row level — a screen-reader smoke if aria-hidden ever migrates)
 * would currently slip through silently.
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

describe("StatsPage heatmap head row leading category-column spacer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1341: stats-cat-heatmap head row leads with an empty stats-heatmap-cat spacer before the day labels", () => {
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    const headRow = grid.querySelector(".stats-heatmap-row--head");
    expect(headRow).not.toBeNull();

    // The first child of the head row must be a `.stats-heatmap-cat` span
    // whose content is empty — it occupies the same grid column as the
    // data rows' category labels (solitaire/cards/dice/board/arcade) so
    // every "Mon".."Sun" header above lines up over its data cells.
    const firstChild = headRow!.firstElementChild as HTMLElement | null;
    expect(firstChild).not.toBeNull();
    expect(firstChild!.tagName).toBe("SPAN");
    expect(firstChild!.classList.contains("stats-heatmap-cat")).toBe(true);
    // No text content — this is a layout spacer, not a visible "Category"
    // header. A non-empty value here would mean the column-align contract
    // changed (or the row regressed to a labelled header).
    expect(firstChild!.textContent ?? "").toBe("");

    // And it must precede the seven day labels (Mon..Sun) in DOM order so
    // the grid columns line up: spacer | Mon | Tue | ... | Sun.
    const dowLabels = headRow!.querySelectorAll(".stats-heatmap-dow");
    expect(dowLabels.length).toBe(7);
    // Spacer's next sibling is the first day label.
    expect(firstChild!.nextElementSibling).toBe(dowLabels[0]);
  });
});
