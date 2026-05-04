import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1438: StatsPage's per-chart "Top played" bar-chart export button
 * (data-testid `stats-export-bar`) carries a `title` attribute with the
 * canonical tooltip copy "Download top-played bar chart as SVG". This
 * native tooltip is the discoverability hook for users hovering the
 * single-chart export icon and differentiates the per-chart SVG export
 * from the combined bundle (W1266) and the JSON/CSV blob downloads
 * (W1396/W1407).
 *
 * Existing tests pin the bar export button's `aria-label` (W1148) and
 * its click-to-download Blob behavior (W1176), but no test pins the
 * `title` tooltip copy. A regression that drops or rewords the title —
 * e.g. during a copy refactor that updates `aria-label` but forgets the
 * sibling `title` — would silently break the native-tooltip contract
 * while every aria/behavior test still passes.
 */
describe("StatsPage — bar chart export button title tooltip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1438: stats-export-bar button exposes 'Download top-played bar chart as SVG' title tooltip", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-bar");
    // Pin the canonical native-tooltip copy for the per-chart bar export.
    expect(btn.getAttribute("title")).toBe(
      "Download top-played bar chart as SVG",
    );
    // Sanity: this is in fact a <button> element.
    expect(btn.tagName).toBe("BUTTON");
  });
});
