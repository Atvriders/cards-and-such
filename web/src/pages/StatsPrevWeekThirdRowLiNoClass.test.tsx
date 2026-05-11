import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2476: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose three <li> rows are rendered as
 * BARE <li> elements with NO `class` attribute at all — the BEM hooks live
 * on the inner <span className="stats-week-label"> and
 * <em className="stats-week-value"> children, never on the <li> wrapper
 * itself. Keeping the <li> hook-free lets the parent <ul>'s
 * `.stats-week-list--prev` modifier own all row-level layout (gap, divider,
 * baseline-typography) via descendant selectors, mirroring the live
 * `stats-week-list` rows above.
 *
 * W1778 already pins the FIRST prev-week <li> as having no class attribute,
 * and W1824 pins the SECOND prev-week <li> as hook-free, but a regression
 * that added `<li className="stats-week-row">` to the THIRD (Prior avg
 * time) prev-week row only — for example, while applying a row-level
 * highlight to the avg-time baseline or extracting only the avg-time row
 * into a sub-component with its own className — would still satisfy
 * W1778/W1824 along with every existing third-row assertion (child count,
 * label tag/copy, value <em> tag) while silently introducing a new styling
 * hook that the prev-week BEM contract intentionally omits. This test
 * pins the THIRD prev-week <li> (the Prior avg time row) as having NO
 * `class` attribute.
 */
describe("StatsPage stats-this-week — prev-week third <li> has no class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2476: stats-prev-week third <li> has no class attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    const rows = prior.querySelectorAll("li");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    const thirdRow = rows[2];
    expect(thirdRow).not.toBeUndefined();
    // The <li> wrapper must be hook-free: no `class` attribute, empty
    // className. All BEM hooks live on the inner <span>/<em> children.
    expect(thirdRow!.hasAttribute("class")).toBe(false);
    expect(thirdRow!.className).toBe("");
  });
});
