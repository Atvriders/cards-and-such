import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2130 — The "Plays by hour of day" card on StatsPage is the
 * `<div className="stats-card" data-testid="stats-hour-of-day">` wrapper that
 * frames the section heading, peak-hour subtitle, and HourChart SVG. Sibling
 * W-tests pin its exact className (W1601: `stats-card` only, no width
 * modifier), its lack of an `id` attribute (W2026), its h2-parent
 * relationship (W1446), and its subtitle tag (W1821) — all keyed off the
 * `data-testid="stats-hour-of-day"` contract. None of them, however, pin the
 * absence of an inline `style` attribute on the card root. Like its
 * neighboring stats-card wrappers (this-week, prev-week, activity, cat-heatmap,
 * personal-records, replays — each of which already has its own
 * `*NoStyle.test.tsx`), the hour-of-day card delegates ALL visual presentation
 * (background, padding, border-radius, grid placement, typography) to the
 * shared `.stats-card` class in `StatsPage.css`. Inline styles on this
 * wrapper would (a) override that stylesheet at the highest specificity,
 * making theme overrides and dark-mode adjustments impossible without
 * `!important`; (b) prevent CSS-only A/B layout experiments from touching
 * the card; and (c) signal that one card is "special" when the design
 * intentionally treats every stats-card uniformly. Pin the absence of a
 * `style` attribute on the hour-of-day card root so a refactor that drops a
 * one-off inline style here fails this test before it ships.
 */
describe("StatsPage hour-of-day card style absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2130: stats-hour-of-day card has no inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-hour-of-day");
    expect(card.hasAttribute("style")).toBe(false);
  });
});
