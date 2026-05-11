import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3034: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy
 * `bordercolorlight` attribute was a Microsoft-proprietary presentational
 * attribute historically supported on <table> elements in old Internet
 * Explorer versions to set the lighter half of a 3D border colour. It was
 * never part of any HTML standard, has no defined semantics on a <ul>, and
 * is ignored by every modern browser. Leaving it present on a presentational
 * list element would still be exposed via DOM serialization and could mislead
 * future refactors, snapshot diffs, or tooling that scans for inline styling
 * hints. Many sibling attribute absences are already pinned on
 * `stats-this-week-list` (cite, id, role, style, tabindex, ARIA, etc.) but
 * no test pins `bordercolorlight`. Pinning it here ensures any future change
 * that accidentally attaches a legacy IE border colour attribute to this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — bordercolorlight attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3034: stats-this-week-list ul has no bordercolorlight attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("bordercolorlight")).toBe(false);
    expect(ul.getAttribute("bordercolorlight")).toBeNull();
  });
});
