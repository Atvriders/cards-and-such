import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1964 — Sibling-test partner to W1822 (cell role absence), W1422 (cell
 * SPAN tag), W1403 (cell visible numeric text), W1761 (cell title zero),
 * and the rest of the `stats-heatmap-cell` family. Those tests each
 * resolve one or two sample cells via data-testid and pin a per-cell
 * contract (className, tag, role absence, title text, etc.). None of
 * them assert how many data cells exist in total — a regression that
 * accidentally dropped a category row or shortened the day-of-week
 * header (e.g. moving Sun outside `DAY_LABELS`) could pass every
 * existing per-cell test while silently rendering 28 or 30 cells.
 *
 * The contract: `HEATMAP_CATEGORIES` has 5 entries
 * (solitaire/cards/dice/board/arcade) and `DAY_LABELS` has 7
 * (Mon..Sun), and `HeatmapChart` emits one `<span class="stats-heatmap-cell">`
 * per (category, day) pair via the nested `.map` — exactly 5 × 7 = 35
 * data cells. The header row uses `.stats-heatmap-dow` / `.stats-heatmap-cat`
 * instead, so it does not contribute. Pin the total directly.
 */
describe("StatsPage heatmap data cell total count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1964: renders exactly 35 stats-heatmap-cell spans (5 categories × 7 days)", () => {
    const { container } = render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const cells = container.querySelectorAll(".stats-heatmap-cell");
    expect(cells.length).toBe(35);
  });
});
