import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onnetworkchange` attribute on the
 * `stats-this-week-list` <ul>. `onnetworkchange` is not a standard HTML
 * event handler attribute and has no defined semantics on a presentational
 * list element. Leaving it present would expose an inert string via DOM
 * serialization and could mislead future refactors or assistive tooling.
 * Pinning its absence here ensures any future change that accidentally
 * attaches an `onnetworkchange` handler attribute to this weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onnetworkchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onnetworkchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onnetworkchange")).toBe(false);
    expect(ul.getAttribute("onnetworkchange")).toBeNull();
  });
});
