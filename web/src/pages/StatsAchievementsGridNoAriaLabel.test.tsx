import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2575: StatsPage's `.achievements-grid` div — the container that wraps
 * each `.achievement-card` (or the `.stats-empty` placeholder when the
 * filtered list is empty) inside the achievements card
 * (data-testid="stats-achievements") — carries NO `aria-label` attribute.
 *
 * Sibling pins on this very element already cover its tagName (W1890,
 * StatsAchievementsContainerTag), its direct-child count (W2322,
 * StatsAchievementsGridChildCount), its EXACT className equality
 * (W2417, StatsAchievementsGridClassName), the absence of an `id`
 * attribute (W2514, StatsAchievementsGridNoId), the absence of a
 * `role` attribute (W2530, StatsAchievementsGridNoRole), the absence
 * of an inline `style` (W2569, StatsAchievementsGridNoStyle), and the
 * absence of a `tabindex` (W2568, StatsAchievementsGridNoTabindex).
 * What is NOT pinned is the absence of an explicit ARIA `aria-label`
 * on the grid itself.
 *
 * The container is — by design — a presentational layout div with no
 * ARIA role. Adding an `aria-label` to a roleless div has subtle but
 * real consequences: (a) some assistive technologies will synthesise an
 * implicit grouping role around the label and announce the element as
 * a landmark/region during landmark navigation, (b) the labelled string
 * becomes part of the accessibility tree and is read out before the
 * children — duplicating the surrounding section's `<h2>Achievements</h2>`
 * heading and creating verbose AT output, (c) the label competes with
 * the per-card `aria-label`s on the `.achievement-card` children for
 * focus order announcements, and (d) translations / i18n contracts
 * silently expand to cover one more user-facing string with no test
 * catching the regression.
 *
 * Pin the ABSENCE of `aria-label` so any future refactor that adds one
 * is caught and reviewed deliberately — at which point the matching
 * role contract, heading-deduplication, and i18n string registration
 * can be evaluated together rather than slipping in by accident.
 */
describe("StatsPage achievements-grid — aria-label attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2575: .achievements-grid container has no aria-label attribute", () => {
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
    // happen to also lack an `aria-label`.
    expect(grid!.classList.contains("achievements-grid")).toBe(true);

    // Pin the absence of `aria-label`. The grid is a presentational
    // layout div with no role; adding an aria-label can synthesise an
    // implicit landmark, duplicate the section heading announcement,
    // and silently expand the i18n surface — all changes that should
    // be made deliberately, not as a drive-by tweak.
    expect(grid!.hasAttribute("aria-label")).toBe(false);
    // Belt-and-suspenders: catches a regression that sets
    // `aria-label=""` (which would still satisfy
    // `hasAttribute("aria-label") === true` but yield an empty string
    // and is itself an anti-pattern that confuses ATs).
    expect(grid!.getAttribute("aria-label")).toBeNull();
  });
});
