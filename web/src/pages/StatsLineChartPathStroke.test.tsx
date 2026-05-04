import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1293 — Sibling to W1236 (line chart SVG role+aria-label). The activity
 * LineChart renders its connecting polyline as a single `<path>` whose
 * stroke is the signature `#60a5fa` blue (Tailwind blue-400) with
 * `fill="none"` so only the outline traces the daily play counts.
 * W1236 pins the chart's accessibility shape and StatsPage.test pins the
 * dot count per range, but no test currently asserts the path's stroke
 * colour or its non-filled silhouette. A refactor that swaps the colour
 * (e.g. to the accent variable, a darker blue, or removes `fill="none"`
 * causing the area beneath to flood-fill) would silently regress the
 * line chart's visual contract — only the SVG export's recolor pass
 * (`querySelectorAll('[stroke="#60a5fa"]')`) depends on this exact
 * literal, so a drift here would also break the export theming without
 * any other Stats* test catching it.
 */

describe("StatsPage line chart — path stroke colour", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1293: stats-line-chart inner <path> uses stroke='#60a5fa' with fill='none'", () => {
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
    expect(path!.getAttribute("stroke")).toBe("#60a5fa");
    expect(path!.getAttribute("fill")).toBe("none");
  });
});
