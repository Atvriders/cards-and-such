import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2530: StatsPage's `.achievements-grid` div — the container that wraps
 * each `.achievement-card` (or the `.stats-empty` placeholder when the
 * filtered list is empty) inside the achievements card
 * (data-testid="stats-achievements") — carries NO `role` attribute.
 *
 * Sibling pins on this very element already cover its tagName (W1890,
 * StatsAchievementsContainerTag), its direct-child count (W2322,
 * StatsAchievementsGridChildCount), its EXACT className equality
 * (W2417, StatsAchievementsGridClassName), and the absence of an `id`
 * attribute (W2514, StatsAchievementsGridNoId). What is NOT pinned is
 * the absence of an explicit ARIA `role` attribute on the grid itself.
 *
 * The container is — by design — a presentational layout div: the
 * achievement cards inside it are independently focusable/interactive
 * (each card carries its own role/aria semantics where applicable), the
 * surrounding card already announces itself via the achievements section
 * heading and `data-testid="stats-achievements"`, and the grid serves
 * purely as a CSS layout host (the `.achievements-grid` class owns the
 * responsive grid template). Assigning a role like `"list"`, `"grid"`,
 * `"group"`, or `"region"` would (a) impose stronger child-role
 * contracts (a `role="list"` requires `role="listitem"` children, a
 * `role="grid"` demands `role="row"`/`role="gridcell"` descendants, a
 * `role="region"` requires an accessible name), (b) change keyboard
 * navigation expectations for AT users, (c) collide with the empty-state
 * branch where a single `.stats-empty` placeholder is the sole child,
 * and (d) silently re-classify the element in the accessibility tree
 * without any test catching the shift.
 *
 * Pin the ABSENCE of `role` so any future refactor that adds one is
 * caught and reviewed deliberately alongside the matching child-role
 * and accessible-name guarantees it would imply.
 */
describe("StatsPage achievements-grid — role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2530: .achievements-grid container has no role attribute", () => {
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
    // we are pinning the right element and not something else that may
    // happen to also lack a `role`.
    expect(grid!.classList.contains("achievements-grid")).toBe(true);

    // Pin the absence of `role`. The grid is a presentational layout
    // div; adding an explicit ARIA role imposes child-role contracts,
    // changes AT navigation semantics, and reclassifies the element in
    // the accessibility tree — all changes that should be made
    // deliberately, not silently.
    expect(grid!.hasAttribute("role")).toBe(false);
    // Belt-and-suspenders: the DOM `role` IDL reflection (when the
    // attribute is absent) is `null`. Catches a regression that sets
    // `role=""` (which would still satisfy `hasAttribute("role")
    // === true` but yield a falsy `getAttribute` result).
    expect(grid!.getAttribute("role")).toBeNull();
  });
});
