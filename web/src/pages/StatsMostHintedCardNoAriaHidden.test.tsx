import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2578: StatsPage's `data-testid="stats-most-hinted"` card — the
 * `.stats-card` wrapper holding the "Most-hinted games" heading and the
 * inner `<ul.stats-most-hinted-list>` (or empty-state `<p>`) — carries NO
 * explicit `aria-hidden` attribute. Sibling pins on this exact element
 * already cover other attribute-shape contracts:
 *   - StatsMostHintedWrapClass.test.tsx (W1631) pins the exact className
 *     `"stats-card"` and tagName=DIV.
 *   - StatsMostHintedCardNoId.test.tsx (W2028) pins absence of `id`.
 *   - StatsMostHintedCardNoStyle.test.tsx (W2131) pins absence of inline
 *     `style`.
 *   - StatsMostHintedNoTabindex.test.tsx (W2259) pins absence of
 *     `tabindex`.
 *   - StatsMostHintedCardNoRole.test.tsx (W2360) pins absence of `role`.
 *   - StatsMostHintedCardNoAriaLabel.test.tsx (W2535) pins absence of
 *     `aria-label`.
 *   - StatsMostHintedCardNoAriaLabelledBy.test.tsx pins absence of
 *     `aria-labelledby`.
 *   - StatsMostHintedCardNoAriaDescribedBy.test.tsx pins absence of
 *     `aria-describedby`.
 *
 * What none of those cover is the ABSENCE of an explicit `aria-hidden`
 * attribute on the most-hinted card wrapper itself. The card is a plain
 * presentational `<div>` whose visible content (the "Most-hinted games"
 * heading and the ranked list of titles) MUST be exposed to assistive
 * technology. Adding `aria-hidden="true"` would silently remove the
 * entire card subtree from the accessibility tree, hiding both the
 * heading and the data from screen-reader users while it remains
 * visible to sighted users — a serious a11y regression. Even
 * `aria-hidden="false"` is undesirable here: it is the default and its
 * presence often signals an inverted intent or copy/paste residue from
 * a hidden-by-default ancestor.
 *
 * Pin the ABSENCE of any `aria-hidden` attribute via `hasAttribute` so
 * even an empty `aria-hidden=""` is caught (HTML treats the empty
 * string as truthy for boolean-style ARIA flags on some platforms).
 * Mirrors the broader unnamed-wrapper contract on sibling stats cards
 * and aligns with W-numbered aria-hidden-absence pins on heatmap cells
 * (StatsHeatmapCellNoAriaHidden.test.tsx) and similar visible content.
 */
describe("StatsPage stats-most-hinted — card aria-hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2578: stats-most-hinted card has no aria-hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the most-hinted card itself and not a
    // descendant that might legitimately carry an aria-hidden of its
    // own. The wrapper is the `<div className="stats-card">` carrying
    // the data-testid.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no explicit `aria-hidden` attribute on the
    // most-hinted card wrapper. `hasAttribute` rather than a
    // specific-value check — even an empty `aria-hidden=""` would
    // remove the subtree from the accessibility tree on some
    // platforms.
    expect(card.hasAttribute("aria-hidden")).toBe(false);
    expect(card.getAttribute("aria-hidden")).toBeNull();
  });
});
