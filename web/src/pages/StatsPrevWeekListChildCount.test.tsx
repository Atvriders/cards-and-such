import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1953: StatsPage's `stats-prev-week` <ul> exposes exactly 3 element
 * children via the DOM-level `childElementCount` property. Sibling tests pin
 * the row tally via `querySelectorAll("li").length` (W1627), the
 * .stats-week-label cardinality (W1759), and the .stats-week-value
 * cardinality (W1760), but none of them assert against `childElementCount`
 * directly. The native property differs from a queried collection in that
 * it counts every Element child of the ul regardless of tag — so a
 * regression that injected a non-<li> sibling (e.g. a stray <div> separator
 * or a leaked footer node) into the prior-week list would still let
 * `querySelectorAll("li").length === 3` pass while silently breaking the
 * BEM list contract. This is the prev-week mirror of W1949 (which pins
 * the same invariant on the this-week list). Pin the raw child element
 * count so the ul stays a clean 3-li container with no foreign element
 * siblings.
 */
describe("StatsPage stats-prev-week — childElementCount", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1953: stats-prev-week ul has childElementCount === 3", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-prev-week");
    // Prior plays, Prior wins, Prior avg time — three element children,
    // no foreign siblings.
    expect(list.childElementCount).toBe(3);
  });
});
