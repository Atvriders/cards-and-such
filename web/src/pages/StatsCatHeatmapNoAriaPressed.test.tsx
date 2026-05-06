import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2747 — The category × day-of-week heatmap root
 * (`data-testid="stats-cat-heatmap"`) is a static, read-only data
 * visualization: it advertises itself as a single image to assistive
 * tech via `role="img"` + a literal `aria-label` (W1250) and is not a
 * toggle button, not a switch-like control, and does not maintain any
 * pressed/unpressed state. The `aria-pressed` attribute is reserved for
 * toggle buttons (`role="button"` with two-state semantics) — applying
 * it to a non-button visualization would either contradict the existing
 * `role="img"` semantics (creating a malformed widget that screen
 * readers report inconsistently) or silently announce phantom toggle
 * state ("pressed"/"not pressed") on what is purely a chart.
 *
 * Already pinned on the same root: aria-label + role="img" (W1250),
 * aria-labelledby absence (W2019), aria-describedby absence (W2386),
 * aria-controls absence (W2650), lang absence (W2692), style absence
 * (W2106). Pin the absence of `aria-pressed` here so a refactor that
 * adds interactive toggle behavior to the heatmap (or copies an
 * `aria-pressed` value from a real toggle button elsewhere on the
 * page) fails loudly before shipping a regression in heatmap
 * screen-reader semantics.
 */
describe("StatsPage cat heatmap aria-pressed absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2747: stats-cat-heatmap root has no aria-pressed attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-pressed")).toBe(false);
  });
});
