import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1448: StatsPage's per-chart "Activity" line-chart export button
 * (data-testid `stats-export-line`) carries a `title` attribute with the
 * canonical tooltip copy "Download activity chart as SVG". This native
 * tooltip is the discoverability hook for users hovering the
 * single-chart export icon and differentiates the per-chart SVG export
 * from the combined bundle (W1266) and the JSON/CSV blob downloads
 * (W1396/W1407).
 *
 * Existing tests pin the line export button's `aria-label` (W1136) and
 * its click-to-download Blob behavior (W1164), but no test pins the
 * `title` tooltip copy. A regression that drops or rewords the title —
 * e.g. during a copy refactor that updates `aria-label` but forgets the
 * sibling `title` — would silently break the native-tooltip contract
 * while every aria/behavior test still passes. Mirrors W1438 (bar
 * title).
 */
describe("StatsPage — line chart export button title tooltip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1448: stats-export-line button exposes 'Download activity chart as SVG' title tooltip", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-line");
    // Pin the canonical native-tooltip copy for the per-chart line export.
    expect(btn.getAttribute("title")).toBe(
      "Download activity chart as SVG",
    );
    // Sanity: this is in fact a <button> element.
    expect(btn.tagName).toBe("BUTTON");
  });
});
