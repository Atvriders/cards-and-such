import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2662 — Sibling-test partner to W2412 (cell aria-hidden absence), W2269
 * (cell tabindex absence), W1822 (cell role absence), and W2065 (cell id
 * absence). The category × day-of-week heatmap pins value-disclosure on the
 * cell's `title` attribute (e.g. "solitaire · Mon: 0", pinned by W1206 and
 * W1761) and on the visible numeric textContent (W1403). The grid root
 * carries the single `aria-label` ("Plays by category and day of week, last
 * 30 days") that summarises the whole region — every individual cell must
 * stay aria-label-free so AT users hear the grid summary once and reach the
 * per-cell counts via the `title` tooltip channel rather than 35 redundant
 * accessible names. A regression that added e.g.
 * `aria-label={`${cat} ${d}: ${v}`}` onto each `<span>` would (a) duplicate
 * the title text into a second AT channel and force screen readers to
 * announce both, (b) override the title-as-accessible-name fallback for
 * zero-count cells where textContent is empty, and (c) silently break the
 * "title is the only per-cell AT surface" contract that the W1206/W1761
 * tooltip tests assume. Existing tests pin className (W1206), data-count
 * + opacity (W1187/W1188), title (W1206/W1761), SPAN tag (W1422), text
 * (W1403), id-absence (W2065), role-absence (W1822), tabindex-absence
 * (W2269), and aria-hidden-absence (W2412) but no test pins the absence
 * of `aria-label` on a data cell. Pin it here so the asymmetry between
 * the grid-level aria-label and the cell-level title-only contract fails
 * loudly on regression.
 */
describe("StatsPage heatmap cell aria-label attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2662: stats-heatmap-cell has no aria-label attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Sample one data cell — the aria-label-absence contract is uniform
    // across all 35 cells, so a single resolution is sufficient.
    const cell = screen.getByTestId("stats-cat-heatmap-solitaire-mon");
    // Sanity: confirm we resolved the data cell (not an unrelated sibling).
    // If this fails first, the data-testid contract changed — debug the
    // W1210 family before this one.
    expect(cell.classList.contains("stats-heatmap-cell")).toBe(true);
    // The actual contract: no aria-label attribute set at all. We use
    // `hasAttribute` (not `getAttribute() === null`) so a stray
    // `aria-label=""` still trips this assertion — the per-cell AT name
    // must come from the `title` tooltip alone, never from a duplicate
    // aria-label that would override or compete with it.
    expect(cell.hasAttribute("aria-label")).toBe(false);
  });
});
