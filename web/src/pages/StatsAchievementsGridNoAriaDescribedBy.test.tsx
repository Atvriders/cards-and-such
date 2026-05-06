import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2596: StatsPage's `.achievements-grid` div — the container that wraps
 * each `.achievement-card` (or the `.stats-empty` placeholder when the
 * filtered list is empty) inside the achievements card
 * (data-testid="stats-achievements") — carries NO `aria-describedby`
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
 * the absence of an `aria-label` (W2575,
 * StatsAchievementsGridNoAriaLabel), and the absence of an
 * `aria-labelledby` (W2592, StatsAchievementsGridNoAriaLabelledBy).
 * What is NOT yet pinned is the absence of an `aria-describedby`
 * reference on the grid itself.
 *
 * `aria-describedby` is the description-side counterpart to the
 * labelling pair already pinned, but it has its own distinct failure
 * modes worth catching independently:
 *   (a) `aria-describedby` points at one or more DOM `id`s — a
 *       refactor that introduces it would create a hidden coupling
 *       between the grid and some descriptive node, and any later
 *       rename/removal of that node's `id` silently breaks the
 *       accessible description with no visual signal.
 *   (b) Applying `aria-describedby` to a roleless presentational
 *       layout div is generally inert in many ATs but in some
 *       (notably JAWS/NVDA in browse mode) it can synthesise an
 *       implicit grouping/region and announce the description
 *       on focus enter, duplicating or competing with the
 *       surrounding `<h2>Achievements</h2>` heading announcement.
 *   (c) An empty or whitespace `aria-describedby=""` is a known
 *       anti-pattern that yields a "no accessible description"
 *       computation and confuses screen readers; the
 *       `getAttribute` belt-and-suspenders below catches that too.
 *   (d) Description text is a UX surface — adding a description
 *       via this attribute (rather than visible copy) hides
 *       guidance from sighted users and is a decision that
 *       should be made deliberately, not as a drive-by tweak.
 *
 * Pin the ABSENCE of `aria-describedby` so any future refactor that
 * adds one is caught and reviewed deliberately alongside its
 * referenced node, role contract, and description-source impact.
 */
describe("StatsPage achievements-grid — aria-describedby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2596: .achievements-grid container has no aria-describedby attribute", () => {
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
    // happen to also lack an `aria-describedby`.
    expect(grid!.classList.contains("achievements-grid")).toBe(true);

    // Pin the absence of `aria-describedby`. The grid is a presentational
    // layout div with no role; adding an aria-describedby reference would
    // introduce a hidden DOM-id coupling, risk synthesising an implicit
    // grouping/region in some ATs, and route description text through a
    // hidden channel rather than visible copy — all changes that should
    // be made deliberately, not as a drive-by tweak.
    expect(grid!.hasAttribute("aria-describedby")).toBe(false);
    // Belt-and-suspenders: catches a regression that sets
    // `aria-describedby=""` (which would still satisfy
    // `hasAttribute("aria-describedby") === true` but yield an empty
    // string and is itself an anti-pattern that confuses ATs by
    // computing "no accessible description").
    expect(grid!.getAttribute("aria-describedby")).toBeNull();
  });
});
