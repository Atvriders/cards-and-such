import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2260: The "Personal records by category" stats card
 * (`data-testid="stats-personal-records-by-category"`) MUST NOT carry
 * a `tabindex` attribute. The card is a presentational `<div>` whose
 * interactive children (if any) supply their own focus order; making
 * the card itself focusable — either via `tabindex="0"` to insert it
 * into the tab sequence, or `tabindex="-1"` to expose it as a
 * programmatic focus target — would change the keyboard-navigation
 * contract of the Stats page in user-visible ways.
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
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the card container. A future refactor that introduced e.g.
 * `tabIndex={0}` to make the whole card a keyboard landing zone, or
 * `tabIndex={-1}` to enable `card.focus()` calls from a "scroll to
 * personal records" affordance, would silently:
 *   1. Add the card to the tab sequence on every render, surprising
 *      keyboard users who currently tab through interactive controls
 *      only and bypass the read-only stats grid entirely.
 *   2. Make the card a programmatic focus target, allowing JS-driven
 *      focus moves that screen readers narrate as the entire card's
 *      accessible name — defeating the per-row testids and h2 heading
 *      that today provide a structured reading order.
 *   3. Diverge from the rest of the `.stats-card` instances on this
 *      page, which are uniformly non-focusable, breaking the
 *      "presentational card" mental model the surrounding pins
 *      (W2029 no-id, W2132 no-style) collectively establish.
 *
 * One focused assertion: the records-by-category card MUST NOT carry
 * a `tabindex` attribute. If a future change deliberately needs the
 * card to be focusable (e.g., a deep-link "jump to personal records"
 * anchor), it should add the new attribute AND update this pin in the
 * same commit, making the keyboard-navigation trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2029 / W2132 pattern so the test shares the
 * `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — personal records by category card has no tabindex attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2260: stats-personal-records-by-category card does NOT carry a tabindex attribute", () => {
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
    // change that relocated the testid onto a non-focusable child
    // could pass the absence-of-tabindex assertion vacuously while a
    // newly-introduced focusable wrapper went uncaught.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no `tabindex` attribute on the card. Use
    // `hasAttribute` (lowercase, the serialized DOM attribute name)
    // rather than reading `.tabIndex` — the IDL property defaults to
    // -1 for non-focusable elements and 0 for some interactive ones,
    // which would mask both the presence of an explicit `tabindex="-1"`
    // and the absence of any attribute at all behind a single number.
    expect(card.hasAttribute("tabindex")).toBe(false);
  });
});
