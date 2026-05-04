import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1534: StatsPage's per-chart "Top played" bar-chart export button
 * (`data-testid="stats-export-bar"`) wraps a 14×14 download-glyph `<svg>`.
 * That inner SVG declares `viewBox="0 0 16 16"` so the two `<path>`
 * children — drawn against a 16-unit canvas — scale crisply at the
 * 14px button size and at any user-zoom level. The viewBox is the
 * coordinate-system contract: a regression that drops it (or swaps to a
 * different origin/extent) would re-anchor the paths off-canvas and
 * either clip the glyph or render it at the wrong scale, producing a
 * blank or garbled icon — while every aria/title/focusable test still
 * passes (those checks never inspect the coordinate system).
 *
 * The stats-export-json button has no inner SVG (it renders a text
 * "JSON" badge `<span>` instead), so no JSON-button-SVG attribute
 * exists to pin. This test pins the sibling bar-export inner SVG's
 * uncovered `viewBox` instead, complementing the existing focusable
 * (W1522), title (W1438), aria-label (W1148), and click-flow (W1176)
 * pins for the same button.
 */
describe("StatsPage — export-bar inner SVG viewBox", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1534: stats-export-bar inner <svg> pins viewBox='0 0 16 16' for the 16-unit download-glyph coordinate system", () => {
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
    // Pin the SVG coordinate-system contract: the inner glyph's two
    // <path>s are drawn for a 16x16 canvas, so the viewBox must be
    // "0 0 16 16" — any other value re-anchors the paths and breaks
    // the rendered icon at the 14px button size.
    expect(svg!.getAttribute("viewBox")).toBe("0 0 16 16");
  });
});
