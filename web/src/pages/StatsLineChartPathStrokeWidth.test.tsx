import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2443 — Sibling to W1293 (line chart <path> stroke colour + fill='none')
 * and W1388 (dot radius). The activity LineChart's connecting <path> is
 * stroked at `strokeWidth="2"` so the daily-play polyline reads as a clear
 * 2px line against the dark Stats panel. W1293 pins the path's colour and
 * non-filled silhouette and W1236 pins the chart's accessibility shape, but
 * no test currently asserts the stroke *thickness* itself. A refactor that
 * bumps the line to 1/3px to "tweak the look", drops the attribute (which
 * would default to 1px in SVG), or moves it into CSS would silently regress
 * the line chart's visual weight without any other Stats* test catching it.
 * Pin the literal so the contract stays stable.
 */

describe("StatsPage line chart — path stroke width", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2443: stats-line-chart inner <path> uses stroke-width='2'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const chart = screen.getByTestId("stats-line-chart");
    const path = chart.querySelector("path");
    expect(path).not.toBeNull();
    expect(path!.getAttribute("stroke-width")).toBe("2");
  });
});
