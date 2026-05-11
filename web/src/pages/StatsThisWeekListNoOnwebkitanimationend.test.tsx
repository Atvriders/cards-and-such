import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onwebkitanimationend` IDL/content attribute is a WebKit-prefixed event
 * handler that fires when a CSS animation completes. The list is a static,
 * presentational summary with no CSS animations bound to it, so attaching an
 * `onwebkitanimationend` handler attribute would either be dead code or, worse,
 * a vector for injecting executable JavaScript via attribute serialization.
 * Pinning its absence here ensures any future refactor that accidentally
 * attaches an inline WebKit animation-end handler to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onwebkitanimationend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onwebkitanimationend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkitanimationend")).toBe(false);
    expect(ul.getAttribute("onwebkitanimationend")).toBeNull();
  });
});
