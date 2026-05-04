import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1407: StatsPage header's "Download CSV" button (data-testid
 * `stats-export-csv`) carries a `title` attribute with the canonical
 * tooltip copy "Download per-game stats summary as CSV
 * (spreadsheet-friendly)". This native tooltip is the discoverability
 * hook for users hovering the CSV export — it differentiates the
 * spreadsheet-friendly CSV blob from the JSON debug blob (W1396) and
 * the combined SVG bundle (W1266). Existing tests cover the button's
 * testid, render position, the CSV badge child, and the click-time
 * Blob payload + canonical CSV header (W564), but no test pins the
 * `title` tooltip copy. A regression that drops or rewords the title
 * — e.g. during a copy refactor that prunes the parenthetical
 * "(spreadsheet-friendly)" hint — would silently break the tooltip
 * contract while every behavior test still passes.
 */
describe("StatsPage header — export CSV button title tooltip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1407: stats-export-csv button exposes 'Download per-game stats summary as CSV (spreadsheet-friendly)' title tooltip", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-csv");
    // Pin the canonical native-tooltip copy for the CSV export.
    expect(btn.getAttribute("title")).toBe(
      "Download per-game stats summary as CSV (spreadsheet-friendly)",
    );
    // Sanity: this is in fact a <button> element.
    expect(btn.tagName).toBe("BUTTON");
  });
});
