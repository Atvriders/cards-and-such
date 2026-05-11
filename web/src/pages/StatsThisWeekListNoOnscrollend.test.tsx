import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onscrollend` attribute is an inline event handler for the `scrollend` event,
 * which fires on scrollable elements when scrolling has finished. The
 * stats-this-week-list ul is a presentational summary list and is not a
 * scroll container in any of its current rendered states; attaching an
 * inline `onscrollend` handler would either be dead code or, worse, execute
 * arbitrary stringified JavaScript pulled in from a future refactor. Pinning
 * its absence here ensures any future change that accidentally attaches an
 * `onscrollend` inline handler to this list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onscrollend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onscrollend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onscrollend")).toBe(false);
    expect(ul.getAttribute("onscrollend")).toBeNull();
  });
});
