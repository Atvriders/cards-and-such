import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2592: StatsPage's `.achievements-grid` div — the container that wraps
 * each `.achievement-card` (or the `.stats-empty` placeholder when the
 * filtered list is empty) inside the achievements card
 * (data-testid="stats-achievements") — carries NO `aria-labelledby`
 * attribute.
 *
 * Sibling pins on this very element already cover its tagName (W1890,
 * StatsAchievementsContainerTag), its direct-child count (W2322,
 * StatsAchievementsGridChildCount), its EXACT className equality
 * (W2417, StatsAchievementsGridClassName), the absence of an `id`
 * attribute (W2514, StatsAchievementsGridNoId), the absence of a
 * `role` attribute (W2530, StatsAchievementsGridNoRole), the absence
 * of an inline `style` (W2569, StatsAchievementsGridNoStyle), the
 * absence of a `tabindex` (W2568, StatsAchievementsGridNoTabindex),
 * and — most adjacent — the absence of an `aria-label` (W2575,
 * StatsAchievementsGridNoAriaLabel). What is NOT yet pinned is the
 * absence of an `aria-labelledby` reference on the grid itself.
 *
 * `aria-labelledby` and `aria-label` are sibling labelling mechanisms
 * but with distinct failure modes worth catching independently:
 *   (a) `aria-labelledby` points at one or more DOM `id`s — a
 *       refactor that introduces it would also introduce a hidden
 *       coupling between the grid and some labelling node, and any
 *       later rename/removal of that node's `id` silently breaks
 *       the accessible name without any visual signal.
 *   (b) Like `aria-label`, applying it to a roleless layout div
 *       can cause some assistive technologies to synthesise an
 *       implicit grouping/region role and announce the grid as a
 *       landmark, duplicating the surrounding `<h2>Achievements</h2>`
 *       heading.
 *   (c) `aria-labelledby` overrides `aria-label` per the ARIA name
 *       computation algorithm — pinning its absence prevents a
 *       silent behaviour change where someone adds `aria-labelledby`
 *       and the existing `aria-label` (if one were ever added) is
 *       no longer the source of the accessible name.
 *   (d) An empty or whitespace `aria-labelledby=""` attribute is
 *       a known anti-pattern that yields a "no accessible name"
 *       computation and confuses screen readers; the
 *       `getAttribute` belt-and-suspenders below catches that too.
 *
 * Pin the ABSENCE of `aria-labelledby` so any future refactor that
 * adds one is caught and reviewed deliberately alongside its
 * referenced node, role contract, and labelling-precedence impact.
 */
describe("StatsPage achievements-grid — aria-labelledby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2592: .achievements-grid container has no aria-labelledby attribute", () => {
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
    // happen to also lack an `aria-labelledby`.
    expect(grid!.classList.contains("achievements-grid")).toBe(true);

    // Pin the absence of `aria-labelledby`. The grid is a presentational
    // layout div with no role; adding an aria-labelledby reference would
    // introduce a hidden DOM-id coupling, override any future
    // `aria-label`, and risk synthesising an implicit landmark that
    // duplicates the section heading announcement — all changes that
    // should be made deliberately, not as a drive-by tweak.
    expect(grid!.hasAttribute("aria-labelledby")).toBe(false);
    // Belt-and-suspenders: catches a regression that sets
    // `aria-labelledby=""` (which would still satisfy
    // `hasAttribute("aria-labelledby") === true` but yield an empty
    // string and is itself an anti-pattern that confuses ATs by
    // computing "no accessible name").
    expect(grid!.getAttribute("aria-labelledby")).toBeNull();
  });
});
