import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2257 — The "Plays by hour of day" card on StatsPage is the
 * `<div className="stats-card" data-testid="stats-hour-of-day">` wrapper that
 * frames the section heading, peak-hour subtitle, and HourChart SVG. Sibling
 * W-tests pin its className (W1601), its lack of an `id` attribute (W2026),
 * its h2-parent relationship (W1446), its subtitle tag (W1821), and the
 * absence of an inline `style` attribute (W2130) — all keyed off the
 * `data-testid="stats-hour-of-day"` contract. None of them, however, pin the
 * absence of a `tabindex` attribute on the card root.
 *
 * The hour-of-day card is a passive presentational `<div>`: it contains a
 * heading, a paragraph subtitle, and a chart. It is NOT an interactive
 * element — there is no click handler, no role override, no keyboard
 * affordance. Adding `tabindex` (whether `0` to insert it into the tab order
 * or `-1` to make it programmatically focusable) would (a) mislead assistive
 * technology into announcing the entire card as focusable content, (b) add a
 * stop in the keyboard tab sequence with no associated action, and (c) drift
 * away from the unified non-tabbable behavior of every neighboring stats-card
 * (this-week, prev-week, activity, cat-heatmap, personal-records, replays).
 *
 * Pin the absence of `tabindex` on the hour-of-day card root so a refactor
 * that accidentally adds focus management to this passive wrapper fails this
 * test before it ships.
 */
describe("StatsPage hour-of-day card tabindex absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2257: stats-hour-of-day card has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-hour-of-day");
    expect(card.hasAttribute("tabindex")).toBe(false);
  });
});
