import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpointerlockerror` attribute is the inline event handler counterpart to
 * the Pointer Lock API's `pointerlockerror` event, which only fires on
 * `document` when a `requestPointerLock()` call fails. It has no defined
 * meaning on a presentational <ul> and, if present, would either silently
 * compile to a no-op handler or — worse — execute attacker-controlled inline
 * script if a value were ever injected. Pinning its absence ensures any
 * future change that accidentally attaches an `onpointerlockerror` handler
 * to this weekly summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerlockerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpointerlockerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerlockerror")).toBe(false);
    expect(ul.getAttribute("onpointerlockerror")).toBeNull();
  });
});
