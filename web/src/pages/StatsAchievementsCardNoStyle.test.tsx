import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2129: StatsPage's `data-testid="stats-achievements"` card — the
 * `.stats-card` wrapper holding the Achievements heading, the search
 * input, the show-locked toggle, and the achievements grid — carries
 * NO inline `style` attribute. Sibling tests already pin its className
 * shape (StatsAchievementsCardClass), absence of an `id`
 * (StatsAchievementsCardNoId), wrapper tagName
 * (StatsAchievementsContainerTag), the title's class
 * (StatsAchievementsTitleClass), the parent section relationship
 * (StatsSectionH2AchievementsParent), and the overall stats card count
 * (StatsCardsCount). What was NOT pinned is the achievements card
 * element itself remaining free of an inline `style` attribute.
 *
 * All visual presentation of the achievements card — padding,
 * background, layout of the search/toggle row, the responsive grid
 * spacing of achievements — flows from the `.stats-card` class hook
 * (and the descendant `.stats-search`, `.stats-show-locked-row`, and
 * `.achievements-grid` rules) in CSS. An inline `style` attribute on
 * the wrapper would (a) raise CSS specificity above the stylesheet
 * and silently shadow stylesheet rules, (b) couple presentation to
 * JS-side string templating instead of a single source of truth in
 * CSS, and (c) defeat the design intent that the achievements card's
 * appearance is controlled exclusively by class hooks. Pin the
 * ABSENCE of `style` on the achievements card so any future refactor
 * that sneaks an inline style onto this wrapper is caught and
 * reviewed.
 */
describe("StatsPage stats-achievements — card style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2129: stats-achievements card has no inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-achievements");
    expect(card).not.toBeNull();
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // Pin the absence of an inline `style` attribute on the
    // achievements card. Visual presentation is owned entirely by the
    // `.stats-card` CSS rule (and its descendant class hooks); an
    // inline style would raise specificity above the stylesheet and
    // couple presentation to JS-side string templating. Must be
    // reviewed deliberately.
    expect(card.hasAttribute("style")).toBe(false);
  });
});
