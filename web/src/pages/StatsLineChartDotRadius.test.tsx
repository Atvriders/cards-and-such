import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1388 — Sibling to W1236 (line chart SVG role+aria-label) and W1293
 * (path stroke colour). The activity LineChart sprinkles a small dot at
 * each daily sample by emitting one `<circle>` per point with `r="2.5"`.
 * StatsPage.test pins the *count* of those circles per range (7/14/90)
 * and W1293 pins the connecting path's colour, but no test currently
 * asserts the dot radius itself. A refactor that bumps the dots to
 * `r="3"`/`r="2"` to "tweak the look", drops the radius attribute (defaulting
 * to 0 / invisible dots), or moves it into CSS via `r=""` would silently
 * regress the chart's visual density without any other Stats* test
 * catching it. Pin the literal so the contract stays stable.
 */

describe("StatsPage line chart — dot radius", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1388: stats-line-chart per-day <circle> dots use r='2.5'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const chart = screen.getByTestId("stats-line-chart");
    const circles = chart.querySelectorAll("circle");
    // Default range is 14d → one circle per day.
    expect(circles.length).toBeGreaterThan(0);
    circles.forEach((c) => {
      expect(c.getAttribute("r")).toBe("2.5");
    });
  });
});
