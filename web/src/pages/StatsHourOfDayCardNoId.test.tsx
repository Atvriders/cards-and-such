import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2026 — The "Plays by hour of day" card on StatsPage is the
 * `<div className="stats-card" data-testid="stats-hour-of-day">` wrapper that
 * holds the section heading, the peak-hour subtitle, and the HourChart SVG.
 * Existing W-tests pin its className (W1601), its h2-parent relationship
 * (W1446), its subtitle tag (StatsHourOfDaySubtitleTag), and its peak-hour
 * label / SVG bar markers (W353), all keyed off `data-testid="stats-hour-of-day"`
 * — none of them assert on an `id` attribute. The card deliberately has no
 * DOM `id`: it is rendered once per StatsPage mount, no in-page anchor links
 * scroll to it, no `<label htmlFor>` references it, and screen-reader / test
 * relations key off the testid + className rather than a DOM id. Adding an
 * `id` would invite duplicate-id collisions if the card is ever rendered
 * twice (e.g. inside a comparison view, a print snapshot, or a modal preview)
 * and would tempt callers to depend on a brittle CSS-id selector that bypasses
 * the testid contract. Pin the absence of `id` on the hour-of-day card root
 * so a refactor that hoists an id onto the wrapper fails here before it ships.
 */
describe("StatsPage hour-of-day card id absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2026: stats-hour-of-day card has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-hour-of-day");
    expect(card.hasAttribute("id")).toBe(false);
  });
});
