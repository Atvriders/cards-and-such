import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2535: StatsPage's `data-testid="stats-most-hinted"` card — the
 * `.stats-card` wrapper holding the "Most-hinted games" heading and the
 * inner `<ul.stats-most-hinted-list>` (or empty-state `<p>`) — carries NO
 * explicit `aria-label` attribute. Sibling pins on this exact element
 * already cover other attribute-shape contracts:
 *   - StatsMostHintedWrapClass.test.tsx (W1631) pins the exact className
 *     `"stats-card"` and tagName=DIV.
 *   - StatsMostHintedCardNoId.test.tsx (W2028) pins absence of `id`.
 *   - StatsMostHintedCardNoStyle.test.tsx (W2131) pins absence of inline
 *     `style`.
 *   - StatsMostHintedNoTabindex.test.tsx (W2259) pins absence of
 *     `tabindex`.
 *   - StatsMostHintedCardNoRole.test.tsx (W2360) pins absence of `role`.
 *   - StatsMostHintedH2NoClass.test.tsx (W2510) pins the inner heading
 *     has no className.
 *   - StatsMostHintedH2Tag.test.tsx (W2516) pins the inner heading
 *     tagName.
 *
 * What none of those cover is the ABSENCE of an explicit `aria-label`
 * attribute on the most-hinted card wrapper itself. The card is a plain
 * presentational `<div>` whose accessible context (when relevant) comes
 * from the inner `<h2>Most-hinted games</h2>` heading, NOT from any
 * wrapper-level aria-label. Adding `aria-label="Most-hinted games"` (or
 * similar) would either:
 *   1. Be redundant with the inner h2 (causing screen readers to either
 *      announce the name twice or — worse — suppress the heading
 *      announcement when paired with a future `role="region"`), or
 *   2. Diverge from the visible heading text, creating a confusing
 *      mismatch between visible and assistive-tech presentations.
 * Combined with the existing `role` absence pin (W2360), this guarantees
 * the card remains an unnamed plain wrapper and is not promoted to a
 * named landmark via a stray aria-label refactor.
 *
 * Pin the ABSENCE of any `aria-label` attribute via `hasAttribute` so
 * even an empty `aria-label=""` is caught (an empty string is itself a
 * meaningful a11y signal — it suppresses the accessible name on some
 * screen readers). Mirrors W2526 (stats-achievements card no
 * aria-label) and the broader unnamed-wrapper contract on sibling
 * stats cards.
 */
describe("StatsPage stats-most-hinted — card aria-label attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2535: stats-most-hinted card has no aria-label attribute", () => {
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
    // descendant that might legitimately carry an aria-label of its
    // own. The wrapper is the `<div className="stats-card">` carrying
    // the data-testid.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no explicit `aria-label` attribute on the
    // most-hinted card wrapper. `hasAttribute` rather than a
    // specific-value check — even an empty `aria-label=""` would
    // alter how some assistive technologies treat the wrapper.
    expect(card.hasAttribute("aria-label")).toBe(false);
    expect(card.getAttribute("aria-label")).toBeNull();
  });
});
