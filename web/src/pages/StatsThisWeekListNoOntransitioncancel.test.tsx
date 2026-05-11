import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ontransitioncancel` attribute is an inline event handler attribute that, if
 * present, would attach JavaScript to run when a CSS transition is cancelled
 * on the element. On a presentational <ul> that has no transitions defined
 * and no need for transition lifecycle hooks, such an attribute would be both
 * meaningless and a potential XSS / inline-script vector. This test pins the
 * absence of `ontransitioncancel` so that any future change that accidentally
 * (or intentionally) attaches an inline transition-cancel handler to this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontransitioncancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ontransitioncancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontransitioncancel")).toBe(false);
    expect(ul.getAttribute("ontransitioncancel")).toBeNull();
  });
});
