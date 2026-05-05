import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2019 — The category × day-of-week heatmap root names itself for
 * assistive tech via a literal `aria-label` (W1250 pins the exact copy
 * "Plays by category and day of week, last 30 days" alongside
 * `role="img"`). Because the heatmap is a self-contained chart that does
 * NOT have a separately rendered visible heading element with a stable
 * `id` to point at, it deliberately does NOT carry an `aria-labelledby`
 * attribute — using both `aria-label` and `aria-labelledby` on the same
 * element is redundant (aria-labelledby would win and silently override
 * the literal copy), and pointing aria-labelledby at a non-existent id
 * would leave the chart unnamed for screen readers. W2001 already pins
 * the absence of `id` on this same root, which means there is also no
 * stable id available for callers to wire aria-labelledby against.
 *
 * Pin the absence of `aria-labelledby` on the stats-cat-heatmap root so
 * a refactor that swaps the literal `aria-label` for an
 * `aria-labelledby` reference (or layers both on, breaking W1250's
 * exact-copy contract) fails here before shipping a regression in
 * heatmap screen-reader naming.
 */
describe("StatsPage cat heatmap aria-labelledby absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2019: stats-cat-heatmap root has no aria-labelledby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-labelledby")).toBe(false);
  });
});
