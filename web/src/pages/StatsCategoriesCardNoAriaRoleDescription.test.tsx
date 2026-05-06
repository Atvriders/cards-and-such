import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2712: StatsPage's "Top played" categories stats card
 * (data-testid="stats-categories") is a plain semantic <div> whose accessible
 * story is carried by the visible <h2>Top played</h2> heading inside it. Other
 * pins on this card already lock its className (W1936), tagName, and absence
 * of `id` (W2027), inline `style` (W2128), `tabindex` (W2258), `aria-label`
 * (W2553), `aria-labelledby`, `aria-describedby`, `aria-controls`, and
 * `aria-hidden`. Sibling cards have their own `aria-roledescription`-absence
 * pins (StatsAchievementsCardNoAriaRoleDescription, StatsPrevWeekNoAriaRoleDescription,
 * StatsThisWeekListNoAriaRoleDescription, StatsCatHeatmapNoAriaRoleDescription,
 * StatsHourChartNoAriaRoleDescription, StatsLineChartNoAriaRoleDescription),
 * but NO existing test pins the absence of an `aria-roledescription` attribute
 * on the stats-categories CARD div itself. Adding an `aria-roledescription`
 * (e.g. "category leaderboard") would (a) require an authored role to be
 * meaningful per ARIA spec, (b) override the screen-reader announcement of
 * any future implicit/explicit role on this card, and (c) introduce a
 * locale-sensitive string that could silently drift from the visible heading.
 * Pin the absence so any future change that attaches a role description to
 * the card div is reviewed deliberately.
 */
describe("StatsPage stats-categories card — aria-roledescription attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2712: stats-categories card has no aria-roledescription attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-roledescription")).toBe(false);
    expect(card.getAttribute("aria-roledescription")).toBeNull();
  });
});
