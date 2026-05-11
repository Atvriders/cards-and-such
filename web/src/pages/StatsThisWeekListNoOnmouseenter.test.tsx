import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onmouseenter` content attribute is an inline event handler that would
 * execute arbitrary script when the pointer enters the element. The weekly
 * summary list is a passive, presentational container with no interactive
 * hover behavior, so an `onmouseenter` attribute has no legitimate purpose
 * here and would constitute an inline-script injection vector that bypasses
 * React's synthetic event system. Pinning its absence ensures any future
 * change that accidentally attaches an inline `onmouseenter` handler to this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmouseenter attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmouseenter attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseenter")).toBe(false);
    expect(ul.getAttribute("onmouseenter")).toBeNull();
  });
});
