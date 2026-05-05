import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2388: StatsPage's responsive `.stats-card-grid` <section> wrapper currently
 * has NO `data-testid` attribute of its own. Sibling pins already cover
 * several attribute-shape contracts on this same section:
 *   - StatsPage.test.tsx W1235 pins tagName=SECTION + classList membership.
 *   - StatsCardGridClass.test.tsx (W1918) pins exact className equality.
 *   - StatsCardGridAria.test.tsx (W1930) pins aria-label/aria-labelledby
 *     absence.
 *   - StatsCardGridNoId.test.tsx (W1998) pins absence of `id`.
 *   - StatsCardGridNoRole.test.tsx (W2018) pins absence of `role`.
 *   - StatsCardGridNoStyle.test.tsx (W2102) pins absence of inline `style`.
 *   - StatsCardGridNoTabindex.test.tsx (W2230) pins absence of `tabindex`.
 *
 * What none of those cover is the ABSENCE of a `data-testid` attribute on
 * the `.stats-card-grid` <section> itself. Every existing test that needs
 * to address the grid wrapper resolves it indirectly — by climbing from a
 * stable child anchor (`screen.getByTestId("stats-activity").parentElement`)
 * — precisely BECAUSE the wrapper is intentionally test-id-less. Adding a
 * `data-testid` to the section would silently:
 *   1. Create a new public test-locator surface that downstream tests and
 *      e2e specs would come to depend on, making removal a hidden breaking
 *      change.
 *   2. Couple test discovery to the wrapper rather than to the meaningful
 *      child cards (each of which already exposes its own data-testid like
 *      `stats-activity`, `stat-total-played`, `stats-categories`, ...),
 *      blurring the contract that the wrapper is a layout-only element.
 *   3. Cause the `parentElement`-based resolution used by the entire
 *      sibling pin family above to become subtly redundant / rotted, since
 *      future authors may switch to `getByTestId(...)` on the wrapper and
 *      drift away from the established convention.
 *
 * Pin the ABSENCE of any `data-testid` attribute on the `.stats-card-grid`
 * <section>, using `hasAttribute` so even an empty `data-testid=""` is
 * caught.
 */
describe("StatsPage stats-card-grid — section data-testid attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  it("W2388: .stats-card-grid <section> has no data-testid attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Resolve the section via a stable, attribute-independent anchor: the
    // first .stats-card child carries data-testid="stats-activity", and
    // its parent is the `.stats-card-grid` <section> wrapper. This same
    // climbing pattern is what every sibling pin in the family relies on,
    // and is itself the contract being protected here — if the wrapper
    // grew its own data-testid, authors would be tempted to short-circuit
    // this convention.
    const activity = screen.getByTestId("stats-activity");
    const grid = activity.parentElement;
    expect(grid).not.toBeNull();

    // Sanity: confirm we pinned the section under test and not, say, a
    // descendant card. Without this guard a future restructure that moved
    // the className onto a wrapper could pass the absence assertion
    // vacuously (because we'd be checking the wrong element).
    expect(grid!.tagName).toBe("SECTION");
    expect(grid!.classList.contains("stats-card-grid")).toBe(true);

    // The actual contract: no `data-testid` attribute on the grid section.
    // `hasAttribute` rather than a value comparison — even an empty
    // `data-testid=""` would create a queryable test surface and must be
    // reviewed deliberately.
    expect(grid!.hasAttribute("data-testid")).toBe(false);
  });
});
