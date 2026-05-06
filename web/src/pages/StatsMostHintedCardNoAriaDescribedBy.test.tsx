import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2570: StatsPage's `data-testid="stats-most-hinted"` card — the
 * `.stats-card` wrapper holding the "Most-hinted games" heading and
 * the inner `<ul.stats-most-hinted-list>` (or empty-state `<p>`) —
 * carries NO explicit `aria-describedby` attribute. Sibling pins on
 * this exact element already cover other attribute-shape contracts:
 *   - StatsMostHintedWrapClass.test.tsx (W1631) pins the exact
 *     className `"stats-card"` and tagName=DIV.
 *   - StatsMostHintedCardNoId.test.tsx (W2028) pins absence of `id`.
 *   - StatsMostHintedCardNoStyle.test.tsx (W2131) pins absence of
 *     inline `style`.
 *   - StatsMostHintedNoTabindex.test.tsx (W2259) pins absence of
 *     `tabindex`.
 *   - StatsMostHintedCardNoRole.test.tsx (W2360) pins absence of
 *     `role`.
 *   - StatsMostHintedCardNoAriaLabel.test.tsx (W2535) pins absence
 *     of `aria-label`.
 *   - StatsMostHintedCardNoAriaLabelledBy.test.tsx pins absence of
 *     `aria-labelledby`.
 *
 * What none of those cover is the ABSENCE of an explicit
 * `aria-describedby` attribute on the most-hinted card itself. The
 * card is a plain presentational `<div>` whose semantic content is
 * provided by the inner `<h2>Most-hinted games</h2>` heading and
 * the descendant ranked list — there is no separate descriptor
 * element wired into the wrapper. Adding `aria-describedby` would:
 *   1. Force creation/maintenance of a referenced descriptor element
 *      whose id must remain stable across refactors, OR
 *   2. Point at an existing element (e.g. one of the per-row count
 *      spans or the play link) and conflate "description" with
 *      "data row content", which would mislead assistive
 *      technologies into announcing unrelated content as the card's
 *      description.
 * Combined with the existing role/aria-label/aria-labelledby
 * absence pins on this same wrapper, this guarantees the most-hinted
 * card stays an unnamed, undescribed plain wrapper and is not
 * promoted to a named/described landmark via a stray
 * aria-describedby refactor. Mirrors W2565 (stats-achievements card
 * no aria-describedby) and the broader unnamed-wrapper contract on
 * sibling stats cards.
 *
 * Pin the ABSENCE of any `aria-describedby` attribute on the
 * most-hinted card using `hasAttribute` so even an empty
 * `aria-describedby=""` is caught (an empty string is itself a
 * meaningful a11y signal that can suppress description resolution).
 */
describe("StatsPage stats-most-hinted — card aria-describedby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2570: stats-most-hinted card has no aria-describedby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the most-hinted card itself and not
    // a descendant that might legitimately carry an aria-describedby
    // of its own. The wrapper is the `<div className="stats-card">`
    // carrying the data-testid.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no explicit `aria-describedby` attribute
    // on the most-hinted card wrapper. `hasAttribute` rather than a
    // specific-value check — even an empty `aria-describedby=""`
    // would alter how some assistive technologies treat the wrapper.
    expect(card.hasAttribute("aria-describedby")).toBe(false);
  });
});
