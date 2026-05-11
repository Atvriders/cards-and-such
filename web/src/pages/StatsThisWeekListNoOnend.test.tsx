import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onend`
 * attribute is not a standard HTML event handler attribute on a <ul> (or on
 * any standard HTML element — `onend` only appears on SMIL animation
 * elements). Leaving such an attribute present on this presentational list
 * would have no defined behavior but could be misinterpreted by tooling,
 * crawlers, or future refactors. A wide array of other this-week-list
 * attribute absences are pinned (id, role, style, tabindex, ARIA, cite,
 * etc.), but no test pins `onend` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onend` attribute to this weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onend")).toBe(false);
    expect(ul.getAttribute("onend")).toBeNull();
  });
});
