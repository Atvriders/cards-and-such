import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1440 — Sibling-test partner to W1210 (5 data rows + ordered text content),
 * W1364 (data-row label SPAN tag), W1369 (label firstElementChild position),
 * W1341 (head row spacer), and W1278 (row container DIV). Each data-row
 * category label in the heatmap is rendered as
 * `<span className="stats-heatmap-cat">{cat}</span>` — a *text-only leaf*
 * that holds the bare category name with no inner element wrapper, icon,
 * <em>/<strong>, or sublabel. W1210 already pins the ordered textContent and
 * W1364 pins the SPAN tag, but neither asserts the label has *no* element
 * children: a refactor that wrapped the name in an `<i className="stats-heatmap-cat-icon">`
 * before the text, appended a `<sup>` badge for "favorite" highlighting, or
 * split the name into `<span>{cat[0]}</span><span>{cat.slice(1)}</span>` for
 * a glyph-style first-letter treatment would still satisfy
 * `textContent === cat` (concatenation across child elements) and the SPAN
 * tag/firstElementChild pins, but would inject child boxes that fight the
 * 1+7 CSS grid column allocation and could re-trigger inline-flow layout
 * inside the label cell. Pin `childElementCount === 0` on every data-row
 * label here so any such inner wrapping fails loudly at the row that was
 * changed.
 */
describe("StatsPage heatmap data-row category label leaf shape", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1440: stats-heatmap-cat data-row label has no element children (text-only leaf) on every data row", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    // Exclude the decorative head row (its leading `.stats-heatmap-cat` is an
    // empty spacer span — W1341 already pins that). We only inspect labels
    // on the 5 data rows.
    const dataRows = Array.from(
      grid.querySelectorAll(".stats-heatmap-row"),
    ).filter((r) => !r.classList.contains("stats-heatmap-row--head"));
    expect(dataRows.length).toBe(5);

    for (const row of dataRows) {
      const label = row.querySelector(".stats-heatmap-cat") as HTMLElement | null;
      expect(label).not.toBeNull();
      // Lock the label to a text-only leaf: zero element children. A wrapped
      // inner `<i>`/`<span>`/`<sup>` (icon, badge, glyph-split) would push
      // this above 0 and fail here, even if the concatenated textContent
      // still matched the category name.
      expect(label!.childElementCount).toBe(0);
    }
  });
});
