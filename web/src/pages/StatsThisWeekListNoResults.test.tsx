import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3098: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `results`
 * attribute is a non-standard WebKit-only extension valid on <input type="search">
 * elements, where it hints how many previous search results the browser should
 * surface. On a <ul> the attribute carries no defined semantics, but leaving it
 * present would still be exposed via DOM serialization and could mislead assistive
 * technology, future refactors, or tooling that tries to interpret it. Many other
 * this-week-list attribute absences are pinned (id, role, style, tabindex, cite,
 * ARIA, etc.), but no test pins `results` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches a `results`
 * attribute to this presentational weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — results attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3098: stats-this-week-list ul has no results attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("results")).toBe(false);
    expect(ul.getAttribute("results")).toBeNull();
  });
});
