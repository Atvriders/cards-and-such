import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onsubmit` event handler attribute is only
 * meaningful on <form> elements, where it fires when the form is submitted.
 * On a presentational <ul> it carries no defined semantics, but if it were
 * present as an inline attribute it would register an inline event handler
 * string that could be evaluated by the browser and bypass CSP, or be
 * misinterpreted by tooling that scans for inline handlers. Sibling tests
 * pin the absence of many other attributes on this <ul>; this test pins the
 * absence of `onsubmit` so any future change that accidentally attaches an
 * inline submit handler to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onsubmit attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onsubmit attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsubmit")).toBe(false);
    expect(ul.getAttribute("onsubmit")).toBeNull();
  });
});
