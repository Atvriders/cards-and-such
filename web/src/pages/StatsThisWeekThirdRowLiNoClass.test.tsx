import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1812: StatsPage's `stats-this-week` card renders the current-week summary
 * <ul data-testid="stats-this-week-list"> whose three <li> rows are rendered
 * as BARE <li> elements with NO `class` attribute at all — the BEM hooks
 * live on the inner <span className="stats-week-label">,
 * <em className="stats-week-value"> and <span className="stats-week-delta">
 * children, never on the <li> wrapper itself. Keeping the <li> hook-free
 * lets the parent <ul>'s `.stats-week-list` class own all row-level layout
 * (gap, divider, baseline-typography) via descendant selectors. This
 * mirrors the prior-week list contract pinned by W1778, the first
 * this-week row pinned by W1789, and the second this-week row pinned by
 * W1801, ensuring every row in both sibling <ul>s shares the same
 * hook-free row shape.
 *
 * W1789 and W1801 already pin the first and second this-week <li>s as
 * having no class attribute, but a regression that added
 * `<li className="stats-week-row">` to the third (Avg time) row only — for
 * example, while extracting a shared row component or applying a row-level
 * highlight to the avg-time line — would still satisfy W1789/W1801 along
 * with every existing this-week assertion (row count, child count, label
 * tag/copy, value <em> tag) while silently introducing a new styling hook
 * that the this-week BEM contract intentionally omits. This test pins the
 * THIRD this-week <li> (the Avg time row) as having NO `class` attribute.
 */
describe("StatsPage stats-this-week — this-week third <li> has no class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1812: stats-this-week-list third <li> has no class attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const rows = list.querySelectorAll("li");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    const thirdRow = rows[2];
    expect(thirdRow).not.toBeUndefined();
    // The <li> wrapper must be hook-free: no `class` attribute, empty
    // className. All BEM hooks live on the inner <span>/<em> children.
    expect(thirdRow!.hasAttribute("class")).toBe(false);
    expect(thirdRow!.className).toBe("");
  });
});
