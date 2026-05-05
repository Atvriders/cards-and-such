import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2065 — Sibling-test partner to W1822 (cell role absence), W1192 (cell
 * className), W1206 (cell title), W1210 (cell data-count), W1403 (cell
 * visible numeric text), W1422 (cell SPAN tag), and W1761 (cell title
 * with zero count). Each `.stats-heatmap-cell` is a purely presentational
 * span that intentionally carries NO `id` attribute — cells are addressed
 * via their `data-testid` (`stats-cat-heatmap-<cat>-<day>`) and styled
 * via their className. Sprinkling unique `id`s onto the 35 grid cells
 * would risk colliding with consumer-page anchors, would not survive
 * a category/day rename, and would tempt code into using `getElementById`
 * instead of the testid resolution path that the rest of the suite
 * depends on. A regression that added `id={`heatmap-${cat}-${d}`}` (or
 * any other id) would still leave className, data-count, title, opacity,
 * data-testid, tag, and text content intact while quietly creating an
 * id-pollution surface — pin the absence here.
 */
describe("StatsPage heatmap cell id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2065: stats-heatmap-cell has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Sample one data cell — the id-absence contract is uniform across
    // all 35 cells, so a single resolution is sufficient.
    const cell = screen.getByTestId("stats-cat-heatmap-solitaire-mon");
    // Sanity: confirm we resolved the data cell (not an unrelated sibling).
    // If this fails first, the data-testid contract changed — debug the
    // W1210 family before this one.
    expect(cell.classList.contains("stats-heatmap-cell")).toBe(true);
    // The actual contract: no id attribute set at all. We use
    // `hasAttribute` (not `getAttribute() === null`) so a future stray
    // `id=""` still trips this assertion.
    expect(cell.hasAttribute("id")).toBe(false);
  });
});
