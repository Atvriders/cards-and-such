import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2608: StatsPage's `.achievements-grid` div — the container that wraps
 * each `.achievement-card` (or the `.stats-empty` placeholder when the
 * filtered list is empty) inside the achievements card
 * (data-testid="stats-achievements") — carries NO `aria-hidden` attribute.
 *
 * Sibling pins on this very element already cover its tagName (W1890,
 * StatsAchievementsContainerTag), its direct-child count (W2322,
 * StatsAchievementsGridChildCount), its EXACT className equality
 * (W2417, StatsAchievementsGridClassName), the absence of an `id`
 * attribute (W2514, StatsAchievementsGridNoId), the absence of a
 * `role` attribute (W2530, StatsAchievementsGridNoRole), the absence
 * of an inline `style` (W2569, StatsAchievementsGridNoStyle), the
 * absence of a `tabindex` (W2568, StatsAchievementsGridNoTabindex),
 * the absence of `aria-label` (W2575), `aria-labelledby` (sibling),
 * and `aria-describedby` (sibling). What is NOT pinned is the
 * absence of `aria-hidden` on the grid itself.
 *
 * The grid is the visible container for every achievement card the
 * user can perceive and interact with. Setting `aria-hidden="true"`
 * on it would be catastrophic for assistive technology users:
 * (a) every `.achievement-card` descendant — including their
 * `progressbar` widgets with valuenow/valuemin/valuemax — would be
 * stripped from the accessibility tree, (b) the per-card
 * `aria-label`s and `data-state`-driven status text would be
 * unreachable to screen-reader users, (c) the empty-state
 * `.stats-empty` paragraph announcing "No achievements match." would
 * also be silenced, leaving AT users with no feedback when their
 * filter yields nothing, and (d) even `aria-hidden="false"` is a
 * subtle anti-pattern that some ATs treat as an explicit
 * hidden-then-revealed signal and may announce as a region change.
 *
 * Pin the ABSENCE of `aria-hidden` so any future refactor — for
 * example a virtualisation/skeleton wrapper that toggles visibility,
 * or a transition library that injects `aria-hidden` during animation
 * — is caught and reviewed deliberately, with the AT-tree impact
 * evaluated rather than slipping in by accident.
 */
describe("StatsPage achievements-grid — aria-hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2608: .achievements-grid container has no aria-hidden attribute", () => {
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
    // happen to also lack `aria-hidden`.
    expect(grid!.classList.contains("achievements-grid")).toBe(true);

    // Pin the absence of `aria-hidden`. Setting it to "true" would
    // strip every achievement card (and their progressbar widgets)
    // from the accessibility tree and silence the empty-state
    // message; setting it to "false" is itself an anti-pattern some
    // ATs interpret as an explicit reveal. Neither should appear by
    // accident — adding either deserves a deliberate review.
    expect(grid!.hasAttribute("aria-hidden")).toBe(false);
    // Belt-and-suspenders: catches a regression that sets
    // `aria-hidden=""` (which would still satisfy
    // `hasAttribute("aria-hidden") === true` but yield an empty
    // string the spec treats as truthy in some implementations).
    expect(grid!.getAttribute("aria-hidden")).toBeNull();
  });
});
