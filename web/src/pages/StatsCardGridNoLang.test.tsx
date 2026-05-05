import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2445: StatsPage's responsive `.stats-card-grid` <section> wrapper currently
 * has NO `lang` attribute of its own. Sibling pins already cover several
 * attribute-shape contracts on this same section:
 *   - StatsPage.test.tsx W1235 pins tagName=SECTION + classList membership.
 *   - StatsCardGridClass.test.tsx (W1918) pins exact className equality.
 *   - StatsCardGridAria.test.tsx (W1930) pins aria-label/aria-labelledby
 *     absence.
 *   - StatsCardGridNoId.test.tsx (W1998) pins absence of `id`.
 *   - StatsCardGridNoRole.test.tsx (W2018) pins absence of `role`.
 *   - StatsCardGridNoStyle.test.tsx (W2102) pins absence of inline `style`.
 *   - StatsCardGridNoTabindex.test.tsx (W2230) pins absence of `tabindex`.
 *   - StatsCardGridNoTestid.test.tsx (W2388) pins absence of `data-testid`.
 *
 * What none of those cover is the ABSENCE of a `lang` attribute on the
 * `.stats-card-grid` <section> itself. The grid wrapper renders no localized
 * text of its own (its descendants — h2 headings like "Activity", "Records",
 * etc., and helper copy like "No games played yet." — are all authored in
 * English and inherit the document-level `lang` from <html>). Adding a
 * `lang` attribute to the section would silently:
 *   1. Override the document language for every descendant in the grid,
 *      including dynamic text like category labels and game titles that
 *      must remain controlled by the document root, not a layout wrapper.
 *   2. Mislead screen readers into switching pronunciation rules for an
 *      entire region of the page based on a layout container, not on an
 *      actual language boundary.
 *   3. Break SEO / accessibility audits that flag layout elements carrying
 *      a `lang` attribute when none of their content is in a different
 *      language from the page.
 * Any future need to mark a true language boundary should be expressed on
 * the specific descendant text node, not on this layout wrapper.
 *
 * Pin the ABSENCE of any `lang` attribute on the `.stats-card-grid`
 * <section>, using `hasAttribute` so even an empty `lang=""` is caught.
 */
describe("StatsPage stats-card-grid — section lang attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  it("W2445: .stats-card-grid <section> has no lang attribute", () => {
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
    // climbing pattern is what every sibling pin in the family relies on.
    const activity = screen.getByTestId("stats-activity");
    const grid = activity.parentElement;
    expect(grid).not.toBeNull();

    // Sanity: confirm we pinned the section under test and not, say, a
    // descendant card. Without this guard a future restructure that moved
    // the className onto a wrapper could pass the absence assertion
    // vacuously (because we'd be checking the wrong element).
    expect(grid!.tagName).toBe("SECTION");
    expect(grid!.classList.contains("stats-card-grid")).toBe(true);

    // The actual contract: no `lang` attribute on the grid section.
    // `hasAttribute` rather than a value comparison — even an empty
    // `lang=""` would assert a (null) language boundary on the wrapper
    // that the document root contract should own exclusively.
    expect(grid!.hasAttribute("lang")).toBe(false);
  });
});
