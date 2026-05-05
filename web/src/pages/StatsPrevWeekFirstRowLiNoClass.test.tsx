import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1778: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose three <li> rows are rendered as
 * BARE <li> elements with NO `class` attribute at all — the BEM hooks live
 * on the inner <span className="stats-week-label"> and
 * <em className="stats-week-value"> children, never on the <li> wrapper
 * itself. Keeping the <li> hook-free lets the parent <ul>'s
 * `.stats-week-list--prev` modifier own all row-level layout (gap, divider,
 * baseline-typography) via descendant selectors, mirroring the live
 * `stats-week-list` rows above.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM `--prev` modifier className (W1592), the exact row count (W1627),
 * each row's child count (W1647/W1766/W1772), each row's label tag
 * (W1662/W1678/W1688) and copy (W1606/W1614/W1621), the value <em> tag on
 * every row, and the label/value totals across the list (W1759/W1760).
 * NONE of those assertions inspect whether the <li> wrapper itself carries
 * a class. A regression that added `<li className="stats-week-row">` (for
 * example, while extracting a shared row component) would still satisfy
 * every existing prev-week assertion while silently introducing a new
 * styling hook that the prev-week BEM contract intentionally omits. This
 * test pins the first prev-week <li> as having NO `class` attribute.
 */
describe("StatsPage stats-this-week — prev-week first <li> has no class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1778: stats-prev-week first <li> has no class attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    const firstRow = prior.querySelector("li");
    expect(firstRow).not.toBeNull();
    // The <li> wrapper must be hook-free: no `class` attribute, empty
    // className. All BEM hooks live on the inner <span>/<em> children.
    expect(firstRow!.hasAttribute("class")).toBe(false);
    expect(firstRow!.className).toBe("");
  });
});
