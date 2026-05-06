import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2569: StatsPage's `.achievements-grid` container — the direct DIV
 * child of the achievements card (data-testid="stats-achievements")
 * that lays out the achievement tiles in a responsive grid — carries
 * NO inline `style` attribute. Sibling tests already pin the
 * container's tagName to DIV (StatsAchievementsContainerTag, W1890),
 * its exact className equality (StatsAchievementsGridClassName,
 * W2417), the absence of an `id` (StatsAchievementsGridNoId), the
 * absence of a `role` (StatsAchievementsGridNoRole), and its
 * direct-child count (StatsAchievementsGridChildCount, W2322). What
 * is NOT pinned is the absence of an inline `style` attribute on the
 * grid element itself.
 *
 * The grid's visual presentation — `display: grid`, the
 * `grid-template-columns` track sizing, the row/column gaps, and any
 * responsive breakpoints — is owned entirely by the `.achievements-grid`
 * CSS rule. An inline `style` attribute on the grid would (a) raise
 * CSS specificity above the stylesheet and silently shadow the grid
 * layout rules, (b) couple the layout to JS-side string templating
 * instead of a single source of truth in CSS, and (c) defeat the
 * design intent that the achievements grid's appearance is controlled
 * exclusively by the class hook. Pin the ABSENCE of `style` on the
 * grid container so any future refactor that sneaks an inline style
 * onto this element is caught and reviewed.
 */
describe("StatsPage achievements-grid — style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2569: .achievements-grid container has no inline style attribute", () => {
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
    // Sanity: still a DIV (mirrors W1890) so the assertion below is
    // anchored to the same element other pins target.
    expect(grid!.tagName).toBe("DIV");

    // Pin the absence of an inline `style` attribute on the
    // achievements grid container. Visual presentation (grid layout,
    // template columns, gaps) is owned entirely by the
    // `.achievements-grid` CSS rule; an inline style would raise
    // specificity above the stylesheet and couple presentation to
    // JS-side string templating. Must be reviewed deliberately.
    expect(grid!.hasAttribute("style")).toBe(false);
  });
});
