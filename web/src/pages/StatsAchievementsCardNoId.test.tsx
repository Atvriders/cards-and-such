import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2025: StatsPage's "Achievements" stats card (data-testid="stats-achievements"),
 * which wraps the achievements search input, the show-locked toggle, and the
 * achievements list/empty-state, is currently rendered WITHOUT an `id`
 * attribute. Sibling tests pin a number of adjacent contracts on this same
 * node:
 *   - StatsAchievementsCardClass pins the className.
 *   - StatsAchievementsContainerTag pins tagName=DIV.
 *   - StatsAchievementsTitleClass / StatsSectionH2AchievementsParent pin the
 *     nested "Achievements" h2 and its parent relationship.
 *   - StatsAchEmptyCopy pins the empty-state copy.
 * However, no existing test pins the absence of an `id` attribute on the
 * stats-achievements card element itself. Adding an `id` would create a
 * stable in-page anchor / DOM-query handle (e.g. for fragment links,
 * ScrollSpy targets, label-for relationships, or external scripts) that
 * downstream code could silently come to depend on, turning later removal
 * into a hidden breaking change. The current design routes all addressing
 * through `data-testid` (for tests) and class hooks (for styling) so the
 * card's identity stays decoupled from any in-page anchor contract. Pin the
 * absence of an `id` so any future change that adds one is reviewed
 * deliberately.
 */
describe("StatsPage stats-achievements card — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2025: stats-achievements card has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-achievements");
    expect(card.hasAttribute("id")).toBe(false);
  });
});
