import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1522: StatsPage's per-chart "Top played" bar-chart export button
 * (`data-testid="stats-export-bar"`) wraps a download-glyph `<svg>`. That
 * inner SVG carries the SVG-specific keyboard-navigation pin
 * `focusable="false"` so legacy IE/Edge engines do not insert a phantom
 * tab stop between the export button and the next focusable element
 * (e.g. the bar chart itself or the drill-down panel that follows).
 *
 * Existing tests pin the export button's `title` (W1438), `aria-label`
 * (W1148), and the click-to-download flow (W1176) — but no test pins the
 * sibling `focusable="false"` attribute. A regression that drops or
 * rewrites that attribute (e.g. an icon-component refactor that forwards
 * SVG props but forgets the SVG-only `focusable=` keyboard pin) would
 * silently break the legacy-engine tab-order contract while every
 * aria/click/title test still passes. Mirrors the W1509 line-chart
 * export-button SVG focusable contract.
 */
describe("StatsPage — export-bar inner SVG focusable='false'", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1522: stats-export-bar inner <svg> pins focusable='false' for legacy SVG-keyboard-navigation contract", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-bar");
    const svg = btn.querySelector("svg");
    expect(svg).not.toBeNull();
    // Pin the SVG-keyboard-navigation contract: the inner glyph must
    // expose `focusable="false"` so legacy IE/Edge engines do not steal
    // a tab stop between the export button and the bar chart that
    // immediately follows.
    expect(svg!.getAttribute("focusable")).toBe("false");
  });
});
