import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3296: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onrejectionhandled` attribute is a global event handler attribute defined for
 * <body> and <frameset> elements where it surfaces the `rejectionhandled` event
 * fired when a previously-unhandled promise rejection becomes handled. On a
 * presentational <ul> this attribute has no defined semantics, but leaving an
 * inline handler attached here would expose the weekly summary list to arbitrary
 * promise-rejection bookkeeping, complicate CSP review, and risk silently
 * swallowing or duplicating global rejection telemetry. A wide array of other
 * this-week-list attribute absences are pinned (id, role, style, tabindex,
 * ARIA, cite, etc.), but no test pins `onrejectionhandled` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an inline `onrejectionhandled` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onrejectionhandled attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3296: stats-this-week-list ul has no onrejectionhandled attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onrejectionhandled")).toBe(false);
    expect(ul.getAttribute("onrejectionhandled")).toBeNull();
  });
});
