import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1939 — Sibling-test partner to W1445 (heatmap outer wrapper tag +
 * `classList.contains("stats-heatmap")`) and W1587 (cat-heatmap card
 * wrapper exact className equality at the outer `.stats-card` level).
 * The category × day-of-week heatmap container is rendered as
 * `<div className="stats-heatmap" data-testid="stats-cat-heatmap" ...>`.
 * W1445 pins the wrapper tag and verifies that `stats-heatmap` is among
 * the classList tokens, but it uses `classList.contains` rather than
 * exact equality — meaning a refactor that QUIETLY ADDS a sibling token
 * (e.g. `<div className="stats-heatmap stats-heatmap--compact">` or
 * `stats-heatmap heatmap-grid` to layer a second CSS hook) would slip
 * past every existing assertion. The CSS-grid layout that the inner
 * cells rely on is keyed off the EXACT `stats-heatmap` selector and
 * any extra modifier could re-flow row sizing without tripping the
 * tag, role, aria-label, testid, or contains() guards. Pin the
 * className to its exact value so silent token additions/removals
 * fail loudly here, forcing the change to ship with explicit visual
 * regression review.
 */
describe("StatsPage heatmap container className exact equality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1939: stats-cat-heatmap container className === 'stats-heatmap' (no extra modifier tokens)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-cat-heatmap");
    // Exact equality — not classList.contains — so an additional token
    // like `stats-heatmap--compact`, `stats-heatmap--wide`, or a layered
    // hook like `heatmap-grid` is caught. The bare `stats-heatmap` token
    // is the sole CSS hook the grid layout depends on; any sibling token
    // could fight or override the existing rules.
    expect(card.className).toBe("stats-heatmap");
  });
});
