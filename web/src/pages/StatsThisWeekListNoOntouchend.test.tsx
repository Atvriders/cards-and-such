import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `ontouchend`
 * attribute is an inline event handler that, if present, would execute arbitrary
 * JavaScript on touch-end events and bypass React's synthetic event system. On
 * this presentational weekly summary list it has no purpose, and any inline
 * handler attribute could create XSS surface area, conflict with React's event
 * delegation, or mislead future refactors. Pinning its absence here ensures any
 * future change that accidentally attaches an `ontouchend` handler to this
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontouchend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ontouchend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontouchend")).toBe(false);
    expect(ul.getAttribute("ontouchend")).toBeNull();
  });
});
