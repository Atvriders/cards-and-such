import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2417: StatsPage's achievements card (data-testid="stats-achievements")
 * contains a grid container element whose `className` is exactly the
 * single token "achievements-grid" — nothing else. W1890
 * (StatsAchievementsContainerTag.test.tsx) already pins the container's
 * tagName to DIV and W2322 (StatsAchievementsGridChildCount.test.tsx)
 * pins its direct-child count, but both rely on the
 * `.querySelector(".achievements-grid")` selector which only requires the
 * class TOKEN to be present — it tolerates extra classes silently being
 * appended (e.g. `"achievements-grid achievements-grid--compact"` or a
 * stateful class like `"achievements-grid is-loading"`).
 *
 * Multiple downstream CSS rules target the bare `.achievements-grid`
 * selector for grid layout, and the existing
 * `querySelectorAll(".achievements-grid > *")` traversals (W2322 and
 * StatsPage.test.tsx lines ~286, ~319, ~1353, ~1700) would still match
 * regardless of additional classes. A regression that quietly appends a
 * second class would shift CSS specificity, open a new style-cascade
 * surface, and possibly create a hook that other code or selectors
 * could come to depend on, all while every existing assertion stayed
 * green. Pin the EXACT className equality so a multi-class regression
 * is caught loudly.
 */
describe("StatsPage achievements-grid — exact className equality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2417: .achievements-grid container className equals exactly 'achievements-grid'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen
      .getByTestId("stats-achievements")
      .querySelector(".achievements-grid") as HTMLElement | null;
    expect(grid).not.toBeNull();
    // Sanity: still a DIV (mirrors W1890) so the equality assertion below
    // is anchored to the same element other pins target.
    expect(grid!.tagName).toBe("DIV");
    // Exact-equality pin — distinct from the `.classList.contains` /
    // `querySelector(".achievements-grid")` checks elsewhere; this fails
    // if a refactor appends any additional class token.
    expect(grid!.className).toBe("achievements-grid");
  });
});
