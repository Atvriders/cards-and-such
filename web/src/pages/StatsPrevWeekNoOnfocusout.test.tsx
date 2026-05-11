import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3154: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onfocusout` content attribute
 * registers an inline event handler that fires when focus leaves the element
 * or one of its descendants. This presentational summary list is not interactive
 * and should never wire up inline focus-loss handlers — any such handler would
 * either be dead code or, worse, an XSS-style inline script smuggled in via a
 * future refactor. Sibling tests already pin the absence of many other inline
 * event handler attributes (onclick, onmouseover, etc.) and global/ARIA
 * attributes on this <ul>, but none pin the absence of `onfocusout`. Pinning
 * it here ensures any future change that accidentally attaches an inline
 * `onfocusout` handler to this <ul> is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onfocusout attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3154: stats-prev-week ul has no onfocusout attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfocusout")).toBe(false);
    expect(ul.getAttribute("onfocusout")).toBeNull();
  });
});
