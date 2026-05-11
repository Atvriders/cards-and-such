import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3203: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `ondrop`
 * attribute is an inline event handler for drag-and-drop drop events. The
 * this-week-list is a presentational read-only summary of weekly stats and is
 * not a drop target — nothing inside StatsPage participates in HTML5
 * drag-and-drop, and attaching an inline `ondrop` handler would (a) introduce
 * an inline event handler string that violates strict CSP policies and
 * (b) silently enable drop semantics that the surrounding UX does not handle.
 * The sibling `stats-prev-week` ul already has its `ondrop` absence pinned,
 * and a wide array of other this-week-list attribute absences are pinned
 * (id, role, style, tabindex, ARIA, cite, etc.), but no test currently pins
 * `ondrop` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an inline drop handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondrop attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3203: stats-this-week-list ul has no ondrop attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondrop")).toBe(false);
    expect(ul.getAttribute("ondrop")).toBeNull();
  });
});
