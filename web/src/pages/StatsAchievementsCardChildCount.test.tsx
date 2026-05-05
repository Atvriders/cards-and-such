import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2493: StatsPage's `data-testid="stats-achievements"` card — the
 * `.stats-card` wrapper holding the Achievements heading, search
 * input, show-locked toggle, and achievements grid — has exactly
 * FOUR direct element children, in this fixed structural order:
 *   1. <h2>Achievements</h2>            (already pinned: W1471/W1476/W1883)
 *   2. <input type="search" .../>       (the achievements search box)
 *   3. <label class="stats-show-locked-row">…</label>
 *   4. <div class="achievements-grid">…</div>  (already pinned: W2417)
 *
 * Sibling pins already cover several attribute-shape contracts on
 * this same card:
 *   - StatsAchievementsCardClass.test.tsx (W1944) — exact className.
 *   - StatsAchievementsCardNoId.test.tsx (W2025) — id absence.
 *   - StatsAchievementsCardNoStyle.test.tsx (W2129) — style absence.
 *   - StatsAchievementsNoTabindex.test.tsx (W2256) — tabindex absence.
 *   - StatsAchievementsCardNoRole.test.tsx (W2355) — role absence.
 *   - StatsSectionH2AchievementsParent.test.tsx (W1471/W1476) — h2
 *     is firstElementChild of this card.
 *   - StatsAchievementsGridClassName.test.tsx (W2417) — the grid
 *     descendant's className.
 *   - StatsAchievementsGridChildCount.test.tsx (W2322) — the GRID's
 *     direct-child count when storage is cleared (the empty-state).
 *
 * What none of those cover is the direct-child count of the card
 * ITSELF. The card's structural shape is load-bearing — adding a
 * stray fifth wrapper (e.g. an extra <div> for layout, or a new
 * filter/sort control inserted before the grid) would silently
 * shift CSS sibling selectors, alter tab order through the
 * achievements section, and change which element ends up as
 * `lastElementChild` (the grid). Removing one of the four
 * (e.g. dropping the show-locked toggle into a popover) would
 * regress filtering UX without anything currently catching it.
 *
 * Pin the card's `childElementCount` to exactly 4 so any silent
 * structural change to this wrapper has to be made deliberately.
 */
describe("StatsPage stats-achievements — card direct child count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2493: stats-achievements card has exactly 4 direct element children", () => {
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
    // some other .stats-card on the page (there are several sibling
    // cards in the same section).
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: the card has exactly 4 direct element
    // children. Use `childElementCount` rather than `children.length`
    // for a single, unambiguous structural assertion that ignores
    // whitespace text nodes JSX may emit between elements.
    expect(card.childElementCount).toBe(4);
  });
});
