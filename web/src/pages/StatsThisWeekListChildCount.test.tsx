import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1949: StatsPage's `stats-this-week-list` <ul> exposes exactly 3 element
 * children via the DOM-level `childElementCount` property. Sibling tests pin
 * the row tally via `querySelectorAll("li").length` (W1563), the .stats-week-
 * label cardinality (W1747), and the .stats-week-value cardinality (W1758),
 * but none of them assert against `childElementCount` directly. The native
 * property differs from a queried collection in that it counts every Element
 * child of the ul regardless of tag — so a regression that injected a non-<li>
 * sibling (e.g. a stray <div> separator or a leaked footer node) into the
 * list would still let `querySelectorAll("li").length === 3` pass while
 * silently breaking the BEM list contract. Pin the raw child element count
 * so the ul stays a clean 3-li container with no foreign element siblings.
 */
describe("StatsPage stats-this-week-list — childElementCount", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1949: stats-this-week-list ul has childElementCount === 3", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Plays, Wins, Avg time — three element children, no foreign siblings.
    expect(list.childElementCount).toBe(3);
  });
});
