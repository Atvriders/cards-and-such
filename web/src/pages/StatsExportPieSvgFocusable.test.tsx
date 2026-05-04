import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1525: StatsPage's per-chart "Records" pie-chart export button
 * (`data-testid="stats-export-pie"`) wraps a download-glyph `<svg>`. That
 * inner SVG carries the SVG-specific keyboard-navigation pin
 * `focusable="false"` so legacy IE/Edge engines do not insert a phantom
 * tab stop between the export button and the next focusable element
 * (e.g. the records H2/section content that immediately follows).
 *
 * Existing tests pin the export button's `title` (W1448), `aria-label`
 * (W1136), `type` (W1164 click flow), and the `aria-hidden="true"` on
 * the icon — but no test pins the sibling `focusable="false"` attribute.
 * A regression that drops or rewrites that attribute (e.g. an icon-
 * component refactor that forwards SVG props but forgets the SVG-only
 * `focusable=` keyboard pin) would silently break the legacy-engine
 * tab-order contract while every aria/click/title test still passes.
 * Mirrors the line-chart export contract (W1509) and the bar-chart
 * export contract (W1522).
 */
describe("StatsPage — export-pie inner SVG focusable='false'", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1525: stats-export-pie inner <svg> pins focusable='false' for legacy SVG-keyboard-navigation contract", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-pie");
    const svg = btn.querySelector("svg");
    expect(svg).not.toBeNull();
    // Pin the SVG-keyboard-navigation contract: the inner glyph must
    // expose `focusable="false"` so legacy IE/Edge engines do not steal
    // a tab stop between the export button and the records-section
    // content that immediately follows.
    expect(svg!.getAttribute("focusable")).toBe("false");
  });
});
