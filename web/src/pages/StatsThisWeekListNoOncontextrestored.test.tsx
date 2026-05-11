import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `oncontextrestored` attribute is an event handler content attribute tied to
 * the page lifecycle `contextrestored` event, which fires on Window/Document
 * when a page is restored from the back/forward cache after losing its
 * rendering context. It has no defined meaning on a <ul> element. Leaving it
 * present would still attach an inline event handler that the browser would
 * compile and store on the element, creating an unexpected execution surface
 * and contradicting the presentational role of this list. This test pins the
 * absence of `oncontextrestored` on `stats-this-week-list` so any future
 * change that accidentally attaches such a handler to this weekly summary list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oncontextrestored attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no oncontextrestored attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncontextrestored")).toBe(false);
    expect(ul.getAttribute("oncontextrestored")).toBeNull();
  });
});
