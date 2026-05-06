import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2564: StatsPage's `data-testid="stats-most-hinted"` card — the
 * `.stats-card` wrapper holding the "Most-hinted games" heading and the
 * inner `<ul.stats-most-hinted-list>` (or empty-state `<p>`) — carries NO
 * explicit `aria-labelledby` attribute. Sibling pins on this exact element
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
 *
 * What none of those cover is the ABSENCE of an explicit `aria-labelledby`
 * attribute on the most-hinted card wrapper itself. Because the wrapper
 * intentionally carries NO `role` (W2360) and NO `aria-label` (W2535),
 * any stray `aria-labelledby` would be the third path by which the
 * wrapper could acquire an accessible name — and would silently promote
 * the plain `<div>` from "presentational wrapper" to "named region" once
 * paired with a future `role="region"` refactor. The card's accessible
 * context comes solely from the inner `<h2>Most-hinted games</h2>`
 * heading via document order, NOT from a wrapper-level `aria-labelledby`
 * cross-reference. Adding `aria-labelledby="some-h2-id"` would also
 * require minting a stable `id` on the heading — coupling currently
 * decoupled siblings — so pinning absence here also indirectly protects
 * the heading's no-id shape.
 *
 * Pin the ABSENCE of any `aria-labelledby` attribute via `hasAttribute`
 * so even an empty `aria-labelledby=""` is caught (an empty IDREF list
 * is itself a meaningful — and broken — a11y signal that produces no
 * accessible name but still alters AT heuristics). Mirrors W2547
 * (stats-achievements card no aria-labelledby) and the broader
 * unnamed-wrapper contract on sibling stats cards.
 */
describe("StatsPage stats-most-hinted — card aria-labelledby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2564: stats-most-hinted card has no aria-labelledby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the most-hinted card wrapper itself and
    // not a descendant that might legitimately carry an aria-labelledby
    // of its own. The wrapper is the `<div className="stats-card">`
    // carrying the data-testid.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no explicit `aria-labelledby` attribute on the
    // most-hinted card wrapper. `hasAttribute` rather than a
    // specific-value check — even an empty `aria-labelledby=""` would
    // alter how some assistive technologies treat the wrapper.
    expect(card.hasAttribute("aria-labelledby")).toBe(false);
    expect(card.getAttribute("aria-labelledby")).toBeNull();
  });
});
