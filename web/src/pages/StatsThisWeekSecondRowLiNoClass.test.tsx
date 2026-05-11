import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1801: StatsPage's `stats-this-week` card renders the current-week summary
 * <ul data-testid="stats-this-week-list"> whose three <li> rows are rendered
 * as BARE <li> elements with NO `class` attribute at all — the BEM hooks
 * live on the inner <span className="stats-week-label">,
 * <em className="stats-week-value"> and <span className="stats-week-delta">
 * children, never on the <li> wrapper itself. Keeping the <li> hook-free
 * lets the parent <ul>'s `.stats-week-list` class own all row-level layout
 * (gap, divider, baseline-typography) via descendant selectors. This
 * mirrors the prior-week list contract pinned by W1778 and the first
 * this-week row pinned by W1789, ensuring every row in both sibling <ul>s
 * shares the same hook-free row shape.
 *
 * W1789 already pins the first this-week <li> as having no class attribute,
 * but a regression that added `<li className="stats-week-row">` to the
 * second (Wins) row only — for example, while extracting a shared row
 * component or applying a row-level highlight to the wins line — would
 * still satisfy W1789 along with every existing this-week assertion (row
 * count, child count, label tag/copy, value <em> tag) while silently
 * introducing a new styling hook that the this-week BEM contract
 * intentionally omits. This test pins the SECOND this-week <li> (the Wins
 * row) as having NO `class` attribute.
 */
describe("StatsPage stats-this-week — this-week second <li> has no class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1801: stats-this-week-list second <li> has no class attribute", () => {
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
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const secondRow = rows[1];
    expect(secondRow).not.toBeUndefined();
    // The <li> wrapper must be hook-free: no `class` attribute, empty
    // className. All BEM hooks live on the inner <span>/<em> children.
    expect(secondRow!.hasAttribute("class")).toBe(false);
    expect(secondRow!.className).toBe("");
  });
});
