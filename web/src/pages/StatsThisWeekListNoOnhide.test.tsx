import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onhide`
 * attribute is not a standard HTML event-handler content attribute on a <ul>
 * (it has no defined semantics and is not in the HTML event handler content
 * attribute list). Leaving it present would either be ignored or, worse, be
 * interpreted as inline script by future tooling, posing both a correctness
 * and a security concern. Pinning the absence of `onhide` here ensures any
 * future change that accidentally attaches such an attribute to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onhide attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onhide attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onhide")).toBe(false);
    expect(ul.getAttribute("onhide")).toBeNull();
  });
});
