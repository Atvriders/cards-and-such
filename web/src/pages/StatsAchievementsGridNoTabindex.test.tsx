import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2568: StatsPage's `.achievements-grid` div — the layout container that
 * wraps each `.achievement-card` (or the `.stats-empty` placeholder when
 * the filtered list is empty) inside the achievements card
 * (data-testid="stats-achievements") — carries NO `tabindex` attribute.
 *
 * Sibling pins on this very element already cover its tagName (W1890,
 * StatsAchievementsContainerTag), its direct-child count (W2322,
 * StatsAchievementsGridChildCount), its EXACT className equality (W2417,
 * StatsAchievementsGridClassName), the absence of an `id` attribute
 * (W2514, StatsAchievementsGridNoId), and the absence of an explicit
 * `role` attribute (W2530, StatsAchievementsGridNoRole). What is NOT
 * pinned is the absence of a `tabindex` attribute on the grid itself.
 *
 * The neighbouring `StatsAchievementsNoTabindex` (W2256) pin only covers
 * the OUTER achievements card element (data-testid="stats-achievements"),
 * not the inner `.achievements-grid` layout div. So a regression that
 * adds e.g. `tabindex="-1"` or `tabindex="0"` to the grid would slip
 * through every existing pin in the achievements area.
 *
 * The grid is, by design, a presentational layout host: the achievement
 * cards inside it (and the buttons within them) are the focusable
 * affordances; the grid itself is not interactive. Adding any `tabindex`
 * to it would silently:
 *   (a) inject (or remove) it from the natural Tab order — `tabindex="0"`
 *       makes a non-interactive container land in keyboard navigation
 *       between the search input and the first card, while `tabindex="-1"`
 *       makes it programmatically focusable in a way nothing in the page
 *       currently expects;
 *   (b) shift the document's focus-order semantics in a way no other
 *       test would catch (the className/role/id pins above don't look at
 *       focus-order attributes);
 *   (c) change AT behaviour for users who rely on keyboard navigation
 *       through the achievements list, where the cards — not the grid
 *       wrapper — are meant to be the navigable units.
 *
 * Pin the ABSENCE of any `tabindex` attribute on the grid via
 * `hasAttribute` so even an explicit `tabindex="-1"` (which would still
 * change focus semantics) is caught — not just truthy values.
 */
describe("StatsPage achievements-grid — tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2568: .achievements-grid container has no tabindex attribute", () => {
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
    // Sanity: still a DIV (mirrors W1890) so the absence assertion below
    // is anchored to the same element other pins target.
    expect(grid!.tagName).toBe("DIV");
    // Sanity: the className hook is intact (mirrors W2417) so we know
    // we are pinning the right element and not some other descendant
    // that may happen to also lack a `tabindex`.
    expect(grid!.classList.contains("achievements-grid")).toBe(true);

    // Pin the absence of `tabindex`. The grid is a presentational layout
    // div; the achievement cards inside it (and their buttons) are the
    // focusable affordances. Adding any tabindex would silently change
    // the document's keyboard navigation order and AT semantics.
    expect(grid!.hasAttribute("tabindex")).toBe(false);
    // Belt-and-suspenders: the raw attribute getter returns null when
    // the attribute is absent. Catches a regression that sets
    // `tabindex=""` (which would still satisfy `hasAttribute("tabindex")
    // === true` but yield an empty-string `getAttribute` result).
    expect(grid!.getAttribute("tabindex")).toBeNull();
  });
});
