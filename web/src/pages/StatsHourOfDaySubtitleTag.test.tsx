import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1821: StatsPage's `stats-hour-of-day` card renders a framing subtitle
 * immediately below the <h2>Plays by hour of day</h2> heading. On a fresh
 * install (no time-history samples), the empty-state copy is authored as
 *   <p className="stats-chart-label">
 *     No plays recorded yet — finish a game to start the chart
 *   </p>
 * — a <p> tagName that matches the chart-subtitle convention used by every
 * other stats card (this-week, personal records, personal records by
 * category, replays, top played, activity) so a stylesheet author can
 * target ".stats-chart-label" once and trust the typographic rhythm.
 *
 * Existing tests pin the subtitle's text and its `stats-chart-label`
 * className (W1232), but they use `getByText` which doesn't filter on
 * tagName — a regression that swapped the <p> to a <div>, <span>, or
 * <h3> would still satisfy that contract while silently breaking the
 * paragraph-vs-heading semantic distinction (and any "p.stats-chart-label"
 * descendant selector in the stylesheet). This test locks the subtitle's
 * tagName as "P" via a class-only selector that doesn't pre-filter on tag,
 * so the assertion fails loudly if the element is promoted to a heading
 * or demoted to a generic container. Mirrors W1796 (this-week subtitle
 * tagName) and W1809 (personal-records subtitle tagName).
 */
describe("StatsPage stats-hour-of-day — subtitle tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1821: stats-hour-of-day 'No plays recorded yet …' subtitle uses <p> tagName", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-hour-of-day");
    const subtitle = within(card).getByText(
      "No plays recorded yet — finish a game to start the chart",
    );
    expect(subtitle).toBeInTheDocument();
    // Sanity: the styling hook is still present (re-asserted at element
    // level, not as the lookup filter, so this can't mask the tag check).
    expect(subtitle.className).toContain("stats-chart-label");
    // The framing subtitle must be a <p>, not a <div> / <span> / <h3> /
    // <h4>. This locks the chart-label convention shared across all
    // stats-card subtitles for the hour-of-day card.
    expect(subtitle.tagName).toBe("P");
  });
});
