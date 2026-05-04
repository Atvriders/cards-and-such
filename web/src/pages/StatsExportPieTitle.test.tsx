import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1449: StatsPage's per-chart "Records" time-spent pie-chart export button
 * (data-testid `stats-export-pie`) carries a `title` attribute with the
 * canonical tooltip copy "Download time-spent pie chart as SVG". This
 * native tooltip is the discoverability hook for users hovering the
 * single-chart export icon and differentiates the per-chart SVG export
 * from the combined bundle (W1266) and the JSON/CSV blob downloads
 * (W1396/W1407).
 *
 * Existing tests pin the pie export button's `aria-label` (W1156) and
 * its click-to-download Blob behavior (W1186), and sibling W1438 (bar
 * title) and W1448 (line title) pin those tooltips, but no test pins
 * the pie button's `title` tooltip copy. A regression that drops or
 * rewords the title — e.g. during a copy refactor that updates
 * `aria-label` but forgets the sibling `title` — would silently break
 * the native-tooltip contract while every aria/behavior test still passes.
 */
describe("StatsPage — pie chart export button title tooltip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1449: stats-export-pie button exposes 'Download time-spent pie chart as SVG' title tooltip", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-pie");
    // Pin the canonical native-tooltip copy for the per-chart pie export.
    expect(btn.getAttribute("title")).toBe(
      "Download time-spent pie chart as SVG",
    );
    // Sanity: this is in fact a <button> element.
    expect(btn.tagName).toBe("BUTTON");
  });
});
