import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1587 — Sibling-test partner to W1489 (h2 nested inside the cat-heatmap
 * stats-card), W798 (subtitle copy), and W1171 (empty-state subtitle copy).
 * The category × day-of-week heatmap is wrapped in a plain
 * `<div className="stats-card" data-testid="stats-cat-heatmap-card">` —
 * with NO width modifier (unlike the adjacent
 * `stats-card stats-card--week` "this week" card whose `--week` modifier
 * adds responsive width tweaks). Existing tests pin the wrapper's
 * data-testid (W451 inclusion list, W798/W1171 subtitle copy) and the
 * h2 nesting (W1489), but no test pins the wrapper's exact className
 * string. A refactor that quietly added a modifier (e.g.
 * `stats-card stats-card--wide` to grow the heatmap to span 2 grid
 * columns, mirroring the activity card's `span 2`) would re-flow the
 * stats-card-grid layout without tripping any current assertion — the
 * data-testid, subtitle, and h2 would all still be present. Pin the
 * exact className here so any silent modifier addition fails loudly,
 * forcing the change to ship with an explicit visual-regression review.
 */
describe("StatsPage cat-heatmap card wrapper className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1587: stats-cat-heatmap-card wrapper has exact className 'stats-card' (no width/variant modifier)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-cat-heatmap-card");
    // Exact equality — not classList.contains — so an additional modifier
    // like `stats-card--wide` or `stats-card--full` is caught. The base
    // `stats-card` hook is required (CSS layout depends on it), and the
    // absence of any modifier is the deliberate choice that keeps the
    // heatmap card sized like the other single-column stats cards.
    expect(card.className).toBe("stats-card");
    // Belt-and-suspenders: the wrapper must also be a plain DIV, since
    // the stats-card-grid CSS rules target `.stats-card-grid > div`-shaped
    // children. A swap to <section>/<article> would re-trigger different
    // implicit ARIA roles inside the grid.
    expect(card.tagName).toBe("DIV");
  });
});
