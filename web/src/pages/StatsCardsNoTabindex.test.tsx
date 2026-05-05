import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2284: StatsPage's `.stats-card-grid` <section> renders a fixed set of
 * 11 panel containers, each as `<div className="stats-card …">`. W1902
 * pins the COUNT of these containers (exactly 11 in the default empty
 * state) — but pins nothing about the focus-related attribute shape of
 * those containers as a group.
 *
 * Per-card sibling pins exist for several individual `.stats-card`
 * containers and assert the absence of a `tabindex` attribute on each
 * one in isolation:
 *   - StatsActivityNoTabindex.test.tsx        (stats-activity)
 *   - StatsCategoriesNoTabindex.test.tsx      (stats-categories)
 *   - StatsHourOfDayNoTabindex.test.tsx       (stats-hour-of-day)
 *   - StatsThisWeekNoTabindex.test.tsx        (stats-this-week)
 *   - StatsPersonalRecordsNoTabindex.test.tsx (stats-personal-records)
 *   - StatsRecordsByCatNoTabindex.test.tsx    (stats-personal-records-by-category)
 *   - StatsMostHintedNoTabindex.test.tsx      (stats-most-hinted)
 *   - StatsReplaysNoTabindex.test.tsx         (stats-replays-panel)
 *   - StatsAchievementsNoTabindex.test.tsx    (stats-achievements)
 *
 * What none of those cover is the AGGREGATE invariant across every
 * `.stats-card` container in the grid: that NO card — including ones
 * whose individual NoTabindex pin may not yet exist (e.g. the records
 * pie wrapper or the cat-heatmap card), and including any future card
 * added to the grid — silently grows a `tabindex` attribute. Without
 * an aggregate pin, a refactor that adds a 12th card with `tabIndex={0}`
 * (or even sets `tabIndex={-1}` on an existing card not covered by a
 * sibling pin) would slip through every per-card test.
 *
 * The `.stats-card` containers are presentational grouping wrappers —
 * their actionable descendants (search inputs, toggles, action buttons)
 * already manage their own focus. Promoting any card itself into the
 * tab order would:
 *   1. With `tabIndex={0}`, insert a non-actionable wrapper element
 *      ahead of its real children in the keyboard tab order, creating
 *      an unannounced focus stop on a presentational group.
 *   2. With `tabIndex={-1}`, make the card programmatically focusable
 *      (`element.focus()` would succeed) and create a new undeclared
 *      focus surface that other code (skip-link targets, scroll-into-
 *      view handlers, focus-restoration logic) could come to depend on.
 *
 * Mirror W1902's `querySelectorAll(".stats-card")` aggregate (which
 * counts containers) — pin that EVERY one of those containers has
 * `hasAttribute("tabindex") === false`. Use `hasAttribute` rather than
 * a specific value check so even an explicit `tabindex="-1"` is caught.
 */
describe("StatsPage stats-card-grid — every .stats-card has no tabindex attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2284: every .stats-card container in the grid has no tabindex attribute", () => {
    const { container } = render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const cards = container.querySelectorAll(".stats-card");
    // Sanity: this test is meaningful only if there is at least one
    // .stats-card to inspect. The exact count is pinned by W1902
    // (StatsCardsCount.test.tsx); here we just ensure the assertion
    // below isn't vacuously true.
    expect(cards.length > 0).toBe(true);

    // The actual contract: NO .stats-card container — current or
    // future, exportable or plain or week-modifier — carries a
    // `tabindex` attribute.
    for (const card of Array.from(cards)) {
      expect(card.hasAttribute("tabindex")).toBe(false);
    }
  });
});
