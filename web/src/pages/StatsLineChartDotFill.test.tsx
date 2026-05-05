import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2426 — Sibling to W1388 (StatsLineChartDotRadius pins `r="2.5"`) and
 * W1293 (StatsLineChartPathStroke pins the connecting path's
 * `stroke="#60a5fa"` with `fill="none"`). The activity LineChart paints
 * each daily-sample dot via `<circle ... fill="#60a5fa" />`, matching the
 * connecting path's stroke colour so the dot reads as a node on the line
 * rather than a foreign mark. No existing Stats* test pins that fill
 * literal: a refactor that flips the dots to the accent variable, a
 * darker hue, or `fill="none"` (making the dots transparent dots rings)
 * would silently desaturate the chart without any failure. Pin the exact
 * literal so the contract stays stable.
 */

describe("StatsPage line chart — dot fill colour", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2426: stats-line-chart per-day <circle> dots use fill='#60a5fa'", () => {
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
      expect(c.getAttribute("fill")).toBe("#60a5fa");
    });
  });
});
