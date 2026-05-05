import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2350: StatsPage's `data-testid="stats-activity"` card — the
 * `.stats-card.stats-card--exportable` wrapper holding the Activity
 * heading, summary tiles, the range toggle, and the line-chart export —
 * carries NO explicit `role` attribute. Sibling pins already cover
 * several attribute-shape contracts on this same card:
 *   - StatsActivityCardClass.test.tsx (W1924) pins the exact className.
 *   - StatsActivityNoId.test.tsx (W2000) pins absence of `id`.
 *   - StatsActivityNoAria.test.tsx (W2014) pins absence of aria-label /
 *     aria-labelledby.
 *   - StatsActivityNoStyle.test.tsx (W2123) pins absence of inline style.
 *   - StatsActivityNoTabindex.test.tsx (W2242) pins absence of tabindex.
 *   - StatsActivityChildCount.test.tsx (W1959) pins direct child count.
 *
 * What none of those cover is the ABSENCE of an explicit `role`
 * attribute on the activity card itself. The card is a presentational
 * grouping <div> — its implicit ARIA role is `generic` (no role exposed
 * to assistive tech). Adding an explicit `role` would meaningfully
 * change the accessibility tree:
 *   1. `role="region"` would promote the card to a landmark, but
 *      without an accessible name (no aria-label / aria-labelledby —
 *      see W2014) it would surface as an unnamed landmark, polluting
 *      landmark navigation in screen readers.
 *   2. `role="group"` or `role="figure"` would change how the card is
 *      announced and grouped in the AT tree even though the heading
 *      `<h2>Activity</h2>` already provides a semantic boundary.
 *   3. `role="presentation"` / `role="none"` would strip the implicit
 *      semantics and could break descendant role inheritance for the
 *      embedded `tablist` and chart elements.
 * Either direction would change the page's accessibility contract and
 * should be reviewed deliberately, not slip in via an unrelated
 * refactor.
 *
 * Pin the ABSENCE of any `role` attribute on the activity card, using
 * `hasAttribute` so even an explicit `role="generic"` (which would be
 * redundant but still a contract change) is caught.
 */
describe("StatsPage stats-activity — card role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2350: stats-activity card has no role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the activity card itself and not a
    // descendant. The card is the .stats-card.stats-card--exportable
    // <div> directly addressed by the testid.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);
    expect(card.classList.contains("stats-card--exportable")).toBe(true);

    // The actual contract: no explicit `role` on the activity card.
    // `hasAttribute` rather than a value check — any explicit role
    // (region / group / figure / presentation / generic) would be a
    // contract change that alters the accessibility tree.
    expect(card.hasAttribute("role")).toBe(false);
  });
});
