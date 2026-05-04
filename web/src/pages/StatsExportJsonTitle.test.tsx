import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1396: StatsPage header's "Export JSON" button (data-testid
 * `stats-export-json`) carries a `title` attribute with the canonical
 * tooltip copy "Download your full stats blob as JSON (debugging +
 * backups)". This native tooltip is the discoverability hook for users
 * hovering the JSON export — it differentiates the full debugging blob
 * from the spreadsheet-friendly CSV export and the per-chart SVG
 * exports. Existing tests (W655) cover the click → Blob download
 * behavior and (W1134) the inner `.stats-export-json-badge` glyph, but
 * no test pins the `title` tooltip copy itself. A regression that drops
 * or rewords the title — e.g. during a copy refactor — would silently
 * break the tooltip contract while every behavior test still passes.
 */
describe("StatsPage header — export JSON button title tooltip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1396: stats-export-json button exposes 'Download your full stats blob as JSON (debugging + backups)' title tooltip", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-json");
    // Pin the canonical native-tooltip copy for the JSON export.
    expect(btn.getAttribute("title")).toBe(
      "Download your full stats blob as JSON (debugging + backups)",
    );
    // Sanity: this is in fact a <button> element.
    expect(btn.tagName).toBe("BUTTON");
  });
});
