import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1789: StatsPage's `stats-this-week` card renders the current-week summary
 * <ul data-testid="stats-this-week-list"> whose three <li> rows are rendered
 * as BARE <li> elements with NO `class` attribute at all — the BEM hooks
 * live on the inner <span className="stats-week-label">,
 * <em className="stats-week-value"> and <span className="stats-week-delta">
 * children, never on the <li> wrapper itself. Keeping the <li> hook-free
 * lets the parent <ul>'s `.stats-week-list` class own all row-level layout
 * (gap, divider, baseline-typography) via descendant selectors. This
 * mirrors the prior-week list contract pinned by W1778, ensuring both
 * sibling <ul>s share the same hook-free row shape.
 *
 * Existing this-week tests pin the testid, the <ul> tagName and class
 * (W1593/W1604/W1597), the exact row count (W1626), each row's child count
 * (W1646/W1761/W1764), each row's label tag and copy, the value <em> tag
 * on every row, and the label/value totals across the list (W1758/W1762).
 * NONE of those assertions inspect whether the <li> wrapper itself carries
 * a class. A regression that added `<li className="stats-week-row">` (for
 * example, while extracting a shared row component) would still satisfy
 * every existing this-week assertion while silently introducing a new
 * styling hook that the this-week BEM contract intentionally omits. This
 * test pins the first this-week <li> as having NO `class` attribute.
 */
describe("StatsPage stats-this-week — this-week first <li> has no class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1789: stats-this-week-list first <li> has no class attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const firstRow = list.querySelector("li");
    expect(firstRow).not.toBeNull();
    // The <li> wrapper must be hook-free: no `class` attribute, empty
    // className. All BEM hooks live on the inner <span>/<em> children.
    expect(firstRow!.hasAttribute("class")).toBe(false);
    expect(firstRow!.className).toBe("");
  });
});
