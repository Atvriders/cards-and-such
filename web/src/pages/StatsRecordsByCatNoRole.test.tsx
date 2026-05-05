import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2409: The "Personal records by category" stats card
 * (`data-testid="stats-personal-records-by-category"`) MUST NOT carry
 * an explicit `role` attribute. The card is a presentational `<div>`
 * whose semantics derive entirely from its nested `<h2>` heading and
 * `<ul>` list — there is no ARIA role mapping today, and screen
 * readers traverse it as a generic grouping container that lets the
 * inner heading + list provide the accessible structure.
 *
 * Existing sibling pins on this same card cover:
 *   - W1954 / StatsRecordsByCategoryTag.test.tsx — container tagName === "DIV".
 *   - W1464 / StatsSectionH2PRByCategoryParent.test.tsx — className+testid
 *     and h2 parent relationship.
 *   - W1296 / StatsPrByCatSubtitle.test.tsx — subtitle text + class hook.
 *   - W1333 / StatsPRByCatListClass.test.tsx — `<ul>` modifier class.
 *   - W1977 / StatsRecordsByCategoryH2Tag.test.tsx — h2 tagName.
 *   - W635  / StatsPage.test.tsx — row mapping from cards-best-times.
 *   - W2029 / StatsRecordsByCatCardNoId.test.tsx — absence of `id`.
 *   - W2132 / StatsRecordsByCatCardNoStyle.test.tsx — absence of inline style.
 *   - W2260 / StatsRecordsByCatNoTabindex.test.tsx — absence of `tabindex`.
 *
 * What none of those cover is the ABSENCE of a `role` attribute on the
 * card container. A future refactor that introduced e.g.
 * `role="region"` (to make the card a landmark in the screen-reader
 * rotor), `role="group"` (to gather the heading + list under an
 * explicit grouping semantic), or `role="presentation"` (to strip even
 * the implicit generic-container semantics) would silently:
 *   1. Change the assistive-technology surface area of the page —
 *      `role="region"` adds a new landmark only when paired with an
 *      accessible name, but if that name is missing the card surfaces
 *      as an unnamed region, polluting the landmark list. Pinning the
 *      absence forces the refactor to add an `aria-label` /
 *      `aria-labelledby` deliberately.
 *   2. Diverge from the rest of the `.stats-card` instances on this
 *      page, which are uniformly role-less, breaking the
 *      "presentational card" mental model the surrounding pins
 *      (W2029 no-id, W2132 no-style, W2260 no-tabindex) collectively
 *      establish.
 *   3. Override the implicit generic role with one that may conflict
 *      with the inner `<h2>` and `<ul>` semantics — e.g.
 *      `role="presentation"` on the wrapper would not strip the
 *      child semantics, but would remove the wrapper's own
 *      navigation hooks, surprising AT users who currently treat
 *      `.stats-card` boundaries as orientation cues.
 *
 * One focused assertion: the records-by-category card MUST NOT carry
 * a `role` attribute. If a future change deliberately needs the card
 * to be a landmark or otherwise role-typed (e.g., to expose a
 * "Personal records by category" region in the screen-reader rotor),
 * it should add the new attribute AND update this pin in the same
 * commit, making the accessibility-semantics trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2029 / W2132 / W2260 pattern so the test shares the
 * `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — personal records by category card has no role attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2409: stats-personal-records-by-category card does NOT carry a role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records-by-category");

    // Sanity: confirm we resolved the card container itself (a <div>
    // with the .stats-card class) and not some inner element a future
    // restructure could move the testid onto. Without this guard a
    // change that relocated the testid onto a non-role'd child could
    // pass the absence-of-role assertion vacuously while a newly-
    // introduced role-bearing wrapper went uncaught.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no `role` attribute on the card. Use
    // `hasAttribute` (lowercase, the serialized DOM attribute name)
    // rather than reading any IDL-side default — there is no
    // `.role` IDL property cross-browser-stable enough to assert
    // against, and the absence of an HTML attribute is the precise
    // contract we want to lock down.
    expect(card.hasAttribute("role")).toBe(false);
  });
});
