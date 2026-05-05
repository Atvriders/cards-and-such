import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2504: StatsPage's `data-testid="stats-achievements"` card — the
 * `.stats-card` wrapper holding the Achievements heading, search input,
 * show-locked toggle, and the achievements grid — has the
 * `<div class="achievements-grid">` as its LAST element child, in this
 * fixed structural order:
 *   1. <h2>Achievements</h2>            (firstElementChild — pinned: W1476)
 *   2. <input type="search" .../>
 *   3. <label class="stats-show-locked-row">…</label>
 *   4. <div class="achievements-grid">…</div>  (lastElementChild — THIS pin)
 *
 * Sibling pins already cover several attribute-shape and structural
 * contracts on this same card:
 *   - StatsAchievementsCardClass.test.tsx (W1944) — exact className.
 *   - StatsAchievementsCardNoId.test.tsx (W2025) — id absence.
 *   - StatsAchievementsCardNoStyle.test.tsx (W2129) — style absence.
 *   - StatsAchievementsNoTabindex.test.tsx (W2256) — tabindex absence.
 *   - StatsAchievementsCardNoRole.test.tsx (W2355) — role absence.
 *   - StatsAchievementsContainerTag.test.tsx (W1890) — grid tagName.
 *   - StatsAchievementsCardChildCount.test.tsx (W2493) — childElementCount=4.
 *   - StatsSectionH2AchievementsParent.test.tsx (W1471/W1476) — h2 is
 *     firstElementChild of this card.
 *   - StatsAchievementsGridClassName.test.tsx (W2417) — the grid's exact
 *     className.
 *   - StatsAchievementsGridChildCount.test.tsx (W2322) — the grid's
 *     direct-child count when storage is cleared.
 *
 * What none of those cover is that the `.achievements-grid` container is
 * specifically the LAST element child of the achievements card (i.e. that
 * nothing renders AFTER the grid inside the card). The card's
 * `firstElementChild` is pinned (W1476: the h2), and the total count is
 * pinned (W2493: 4 direct element children), and the grid's identity is
 * pinned by class equality (W2417). But none of those together imply
 * "the grid is the last child":
 *   - If a future refactor appended a footer note (e.g. a "Reset
 *     achievements" link, a count-of-unlocked summary, or an "as-of"
 *     timestamp) BELOW the grid, W2493 would have to be updated to 5,
 *     but if it were updated to 5 in the same change, NOTHING would
 *     enforce that the grid still sits ABOVE that new tail element.
 *   - If a refactor swapped the order of the grid and the show-locked
 *     toggle (rendering the toggle BELOW the grid as a "show more"
 *     control), W1476 (h2 first) and W2493 (count=4) and W2417 (grid
 *     className) would all stay green while the visual hierarchy of
 *     the achievements card silently inverted.
 *   - If a refactor wrapped the grid in an additional layout div, the
 *     grid would no longer be a direct child of the card at all — the
 *     existing `querySelector(".achievements-grid")` checks would still
 *     pass (descendant traversal), but the card's lastElementChild
 *     would change identity.
 *
 * Pin the card's `lastElementChild` to be exactly the `.achievements-grid`
 * div (matched by reference, not by selector lookup) so any silent
 * structural change to the tail of this wrapper has to be made
 * deliberately. Mirrors the "first/last child reference" structural
 * contracts pinned on other stats cards (e.g. W1476 here for the h2
 * first, and the various *FirstChildTag tests for sibling cards).
 */
describe("StatsPage stats-achievements — card last element child", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2504: stats-achievements card's lastElementChild is the .achievements-grid div", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-achievements");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the achievements card itself and not
    // some other .stats-card on the page (mirrors the sanity checks in
    // sibling W2493/W2256/W2355 pins on this same node).
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: the LAST element child of the card is the
    // `.achievements-grid` div — i.e. nothing renders after the grid
    // inside the achievements card. Match by reference so the assertion
    // fails if a future refactor wraps the grid, appends a sibling
    // after it, or reorders the grid above any other direct child.
    const grid = card.querySelector(".achievements-grid") as HTMLElement | null;
    expect(grid).not.toBeNull();
    expect(card.lastElementChild).toBe(grid);
  });
});
