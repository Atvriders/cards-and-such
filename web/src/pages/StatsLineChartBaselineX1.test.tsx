import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2453 — Sibling to W1356 (hour-chart axis baseline `stroke` colour). The
 * activity `LineChart` renders a single horizontal axis baseline as the very
 * first child of its `<svg data-testid="stats-line-chart">` — a `<line>` from
 * `(pad, h-pad)` to `(w-pad, h-pad)` painted with the same faint slate
 * `stroke="rgba(148,163,184,0.25)"` so the daily-play polyline visually rests
 * on a soft rule rather than floating in the SVG viewport. The chart uses
 * `pad=22` (distinct from the bar chart's `pad=24` and the hour chart's own
 * `pad`), so the baseline's left endpoint serializes to `x1="22"`.
 *
 * Existing line-chart pins cover the path's `stroke` (W1293) and
 * `stroke-width` (W2443), the per-day dot `r` (W1388) and `fill` (W2426),
 * the chart's `role`/`aria-label` (W1236), the missing `id` / `style` /
 * `tabindex` / `preserveAspectRatio`, and the container className — but
 * nothing pins the baseline `<line>` geometry itself. A refactor that
 * tightens the padding (e.g. `pad=16` for a wider plot area), drops the
 * baseline entirely, or replaces the `<line>` with a `<rect>` thin-bar would
 * silently regress the chart's axis-vs-polyline hierarchy. Pin `x1` as the
 * cheapest stable proof that the literal-coordinate baseline survives.
 */

describe("StatsPage line chart — axis baseline x1", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2453: stats-line-chart baseline <line> uses x1='22'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The line chart renders exactly one <line> — the axis baseline rule.
    const chart = screen.getByTestId("stats-line-chart");
    const baseline = chart.querySelector("line");
    expect(baseline).not.toBeNull();
    expect(baseline!.getAttribute("x1")).toBe("22");
  });
});
