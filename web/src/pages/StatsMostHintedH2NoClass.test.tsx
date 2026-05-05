import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2510: StatsPage's "Most-hinted games" section heading
 * (`<h2>Most-hinted games</h2>` directly inside the
 * `data-testid="stats-most-hinted"` stats-card div) is currently rendered
 * WITHOUT any `class` attribute — all heading typography flows from the
 * parent stats-card's CSS rules and the global typographic scale.
 *
 * Sibling pins on this same h2 / its containing card already cover:
 *   - parent classList + data-testid relationship + heading text + level
 *     via getByRole (W1488, StatsSectionH2MostHintedParent)
 *   - global `id`-attribute absence on every StatsPage h2
 *     (W2092, StatsH2NoId)
 *   - global inline-`style`-attribute absence on every StatsPage h2
 *     (W2142, StatsH2NoStyle)
 *   - card-level role/id/style/tabindex absence + className equality on
 *     the wrapping stats-card div (W2360, W2028, W2131, W2259, W1631)
 *
 * However, no test pins the absence of a `class` attribute on the
 * Most-hinted-games h2 itself. Adding a className (e.g.
 * `className="stats-most-hinted-title"` mirroring the per-row title span,
 * or `className="stats-card-title"` to migrate to a generic card-title
 * hook) would silently introduce a styling seam that downstream CSS,
 * theme overrides, or query selectors could come to depend on, turning
 * later removal into a hidden breaking change. It would also subtly
 * decouple this h2 from the inherited stats-card heading typography. Pin
 * the absence of a `class` attribute so any future change that adds one
 * is reviewed deliberately.
 */
describe("StatsPage stats-most-hinted h2 — class attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2510: <h2> inside stats-most-hinted has no class attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    const heading = card.querySelector("h2");
    expect(heading).not.toBeNull();
    expect(heading!.hasAttribute("class")).toBe(false);
  });
});
