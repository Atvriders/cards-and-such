import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1266: StatsPage header's "Export all charts" button (data-testid
 * `stats-export-all`) carries a `title` attribute with the canonical
 * tooltip copy "Download all three charts as a single SVG". This native
 * tooltip is the discoverability hook for users hovering the bundle
 * export — it differentiates the combined SVG bundle from the per-chart
 * exports and the JSON/CSV blob downloads. Existing tests cover the
 * button's testid, render position, click behavior (W950 — Blob
 * download) and the JSON/CSV badge children, but no test pins the
 * `title` tooltip copy. A regression that drops or rewords the title —
 * e.g. during a copy refactor — would silently break the tooltip
 * contract while every behavior test still passes.
 */
describe("StatsPage header — export all button title tooltip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1266: stats-export-all button exposes 'Download all three charts as a single SVG' title tooltip", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-all");
    // Pin the canonical native-tooltip copy for the bundle export.
    expect(btn.getAttribute("title")).toBe(
      "Download all three charts as a single SVG",
    );
    // Sanity: this is in fact a <button> element.
    expect(btn.tagName).toBe("BUTTON");
  });
});
