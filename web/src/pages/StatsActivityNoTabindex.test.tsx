import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2242: StatsPage's `data-testid="stats-activity"` card — the
 * `.stats-card.stats-card--exportable` wrapper holding the Activity
 * heading, summary tiles, and the line-chart export — carries NO
 * `tabindex` attribute. Sibling pins already cover several attribute-
 * shape contracts on this same card:
 *   - StatsActivityCardClass.test.tsx pins the exact className.
 *   - StatsActivityNoId.test.tsx pins absence of `id`.
 *   - StatsActivityNoAria.test.tsx pins absence of ARIA noise.
 *   - StatsActivityNoStyle.test.tsx pins absence of inline `style`.
 *   - StatsActivityChildCount.test.tsx pins child count.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the activity card itself. The card is a presentational grouping
 * wrapper — its actionable descendants (the export button, the range
 * controls inside `.stats-range-row`, the chart) already manage their
 * own focus. Adding any `tabindex` to the card would silently:
 *   1. With `tabIndex={0}`, insert the entire card wrapper into the
 *      keyboard tab order ahead of its actionable children, forcing
 *      keyboard users through an unannounced stop on a non-actionable
 *      group element.
 *   2. With `tabIndex={-1}`, make the card programmatically focusable
 *      (`element.focus()` would succeed) and create a new undeclared
 *      focus surface that other code (skip-link targets, scroll-into-
 *      view handlers, export-completion focus restoration) could come
 *      to depend on.
 * Either change would alter the page's focus contract and should be
 * reviewed deliberately, not slip in via an unrelated refactor.
 *
 * Pin the ABSENCE of any `tabindex` attribute on the activity card,
 * using `hasAttribute` so even an explicit `tabindex="-1"` is caught.
 */
describe("StatsPage stats-activity — card tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2242: stats-activity card has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the activity card itself and not, say,
    // a descendant that might legitimately carry a tabindex of its own
    // (e.g. the export button or a focusable chart control).
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);
    expect(card.classList.contains("stats-card--exportable")).toBe(true);

    // The actual contract: no `tabindex` attribute on the activity
    // card. `hasAttribute` rather than a specific value check — even
    // `tabindex="-1"` would make the card programmatically focusable
    // and create a new undeclared focus surface.
    expect(card.hasAttribute("tabindex")).toBe(false);
  });
});
