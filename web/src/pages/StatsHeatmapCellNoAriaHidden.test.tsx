import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2412 — Sibling-test partner to W1198 (head row IS aria-hidden) and the
 * W2269/W1822/W2065 cell-attribute-absence family. The category × day-of-week
 * heatmap deliberately splits its accessibility responsibilities: the
 * decorative head row carries `aria-hidden="true"` so AT users only hear the
 * grid's `aria-label` and per-cell `title` tooltips, while the 35 data cells
 * must NOT be aria-hidden — their `title` attribute (e.g.
 * "solitaire · Mon: 0") is the sole channel by which sighted-and-AT users
 * learn the per-cell counts. A regression that copy-pasted the head row's
 * `aria-hidden="true"` onto the data cells (or wrapped them in an
 * aria-hidden subtree) would silently mute every per-cell tooltip and leave
 * AT users hearing only the grid-level summary "Plays by category and day of
 * week, last 30 days" with no way to drill into individual values. Existing
 * tests pin className (W1206), data-count + opacity (W1187/W1188), title
 * (W1206/W1761), tag (W1422), text (W1403), id-absence (W2065), role-absence
 * (W1822), and tabindex-absence (W2269) but no test pins the absence of
 * `aria-hidden` on a data cell. Pin it here so the asymmetry between the
 * decorative head and the load-bearing data cells fails loudly on regression.
 */
describe("StatsPage heatmap cell aria-hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2412: stats-heatmap-cell has no aria-hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Sample one data cell — the aria-hidden-absence contract is uniform
    // across all 35 cells, so a single resolution is sufficient.
    const cell = screen.getByTestId("stats-cat-heatmap-solitaire-mon");
    // Sanity: confirm we resolved the data cell (not an unrelated sibling).
    // If this fails first, the data-testid contract changed — debug the
    // W1210 family before this one.
    expect(cell.classList.contains("stats-heatmap-cell")).toBe(true);
    // The actual contract: no aria-hidden attribute set at all. We use
    // `hasAttribute` (not `getAttribute() === null`) so a stray
    // `aria-hidden=""` or `aria-hidden="false"` still trips this assertion —
    // the data cells are in the AT tree unconditionally and rely on
    // their `title` tooltip for value disclosure.
    expect(cell.hasAttribute("aria-hidden")).toBe(false);
  });
});
