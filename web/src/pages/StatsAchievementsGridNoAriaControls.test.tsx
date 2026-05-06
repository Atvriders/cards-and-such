import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2612: StatsPage's `.achievements-grid` div — the container that wraps
 * each `.achievement-card` (or the `.stats-empty` placeholder when the
 * filtered list is empty) inside the achievements card
 * (data-testid="stats-achievements") — carries NO `aria-controls`
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
 * the absence of `aria-label` (W2575), `aria-labelledby` (sibling),
 * `aria-describedby` (sibling), and `aria-hidden` (W2608). What is
 * NOT pinned is the absence of `aria-controls` on the grid itself.
 *
 * `aria-controls` declares that an element programmatically governs
 * another element's contents/state — it is appropriate on widgets
 * such as tabs, comboboxes, disclosure buttons, or paginators that
 * own a target region. The achievements grid is none of those: it
 * is a passive presentation container that holds the cards the user
 * filters via the radio-group above. If `aria-controls` were placed
 * on this `<div>` it would (a) lie to assistive technology about the
 * grid's role (a non-widget container with `aria-controls` is a
 * WCAG/ARIA-in-HTML smell that some ATs announce as "controls X"
 * even when no widget semantics are present), (b) require the value
 * to be a space-separated list of EXISTING IDs in the same DOM —
 * any drift (e.g. removing a card with that id, or a typo) would
 * silently leave a dangling reference that linters and axe rules
 * (`aria-valid-attr-value`) flag as a violation, and (c) imply the
 * grid is the controller of the filter radios, which is the exact
 * opposite of the actual relationship — the radios filter the grid.
 *
 * Pin the ABSENCE of `aria-controls` so any future refactor — for
 * instance one that wires the radio-group's `aria-controls` to the
 * grid and accidentally mirrors the attribute back onto the grid,
 * or a tabs/disclosure widget that wraps the grid and pushes its
 * `aria-controls` down by mistake — is caught and reviewed
 * deliberately, with the ARIA-relationship direction evaluated
 * rather than slipping in by accident.
 */
describe("StatsPage achievements-grid — aria-controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2612: .achievements-grid container has no aria-controls attribute", () => {
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
    // happen to also lack `aria-controls`.
    expect(grid!.classList.contains("achievements-grid")).toBe(true);

    // Pin the absence of `aria-controls`. Adding it would lie about
    // the grid's role (it is not a widget that owns another region),
    // invert the actual filter-controls-grid relationship, and
    // introduce an ID-reference that any future card removal could
    // silently break. Neither presence nor any value should appear
    // by accident — adding it deserves a deliberate review.
    expect(grid!.hasAttribute("aria-controls")).toBe(false);
    // Belt-and-suspenders: catches a regression that sets
    // `aria-controls=""` (which would still satisfy
    // `hasAttribute("aria-controls") === true` but yield an empty
    // string that ARIA treats as an invalid IDREF list).
    expect(grid!.getAttribute("aria-controls")).toBeNull();
  });
});
