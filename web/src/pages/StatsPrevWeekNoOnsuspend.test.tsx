import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list
 * stats-week-list--prev". The `onsuspend` content attribute is an event
 * handler attribute for the media element suspend event; it has no defined
 * meaning on a presentational <ul>. Leaving it present would still register
 * an inline event handler via DOM parsing semantics, creating both a CSP /
 * inline-script hazard and a maintenance trap. Sibling tests pin the absence
 * of many other inline event-handler and global attributes on this <ul>, but
 * none pin the absence of `onsuspend`. Pinning it here ensures any future
 * change that accidentally attaches an `onsuspend` handler to this summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onsuspend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onsuspend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsuspend")).toBe(false);
    expect(ul.getAttribute("onsuspend")).toBeNull();
  });
});
