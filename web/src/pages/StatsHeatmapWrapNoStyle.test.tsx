import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2138 — Sibling-test partner to W2106 (StatsCatHeatmapNoStyle, which pins
 * the absence of `style` on the inner `stats-cat-heatmap` grid root) and to
 * W1587 (StatsHeatmapCardWrapClass, which pins the exact className of the
 * outer wrapper). The category × day-of-week heatmap is rendered inside an
 * outer `<div className="stats-card" data-testid="stats-cat-heatmap-card">`
 * card wrapper at StatsPage.tsx ~line 1551. Unlike W2106 — which targets
 * the INNER grid div — this test pins the OUTER card wrapper's lack of any
 * inline `style` attribute. All of the outer card's visual presentation
 * (padding, border-radius, background, grid-cell width) is owned by the
 * `.stats-card` className in the StatsPage stylesheet so that user-level
 * theme overrides (high-contrast, dark mode, accent-color) and the
 * stats-card-grid layout rules can win without inline-style specificity
 * fights.
 *
 * The slip-through this test catches: a refactor that smuggles
 * `style={{ gridColumn: "span 2", maxWidth: "640px" }}` (or any other
 * runtime layout hint) onto the outer card — for example, to dynamically
 * widen the heatmap when more categories are introduced — would silently
 * override the className-driven theme contract and pass every existing
 * outer-card test (W451 inclusion, W798/W1171 subtitle copy, W1489 h2
 * nesting, W1587 exact-className equality). Inline styles on the outer
 * card would also raise the CSP burden if the app ever moves to
 * `style-src 'self'` without `'unsafe-inline'`. Pin the absence of any
 * inline `style` attribute on the outer wrapper so drift fails loudly here.
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

describe("StatsPage heatmap outer card wrapper has no inline style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2138: stats-cat-heatmap-card outer .stats-card wrapper carries no inline style attribute (CSS-only, no runtime layout overrides)", () => {
    renderPage();

    const card = screen.getByTestId("stats-cat-heatmap-card");
    // Sanity: confirm we have the outer card, not the inner grid root —
    // the outer wrapper is a DIV with the .stats-card hook (W1587).
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // Pin: no inline `style` attribute on the outer wrapper. Both the
    // hasAttribute and getAttribute paths are checked so a future API
    // shim or polyfill that diverges between the two cannot mask drift.
    expect(card.hasAttribute("style")).toBe(false);
    expect(card.getAttribute("style")).toBeNull();
  });
});
