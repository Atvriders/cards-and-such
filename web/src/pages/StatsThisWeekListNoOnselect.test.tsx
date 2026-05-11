import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onselect`
 * IDL/content attribute is a text-selection event handler defined on form
 * controls such as <input> and <textarea>; on a presentational <ul> it has no
 * defined semantics. Leaving an `onselect` attribute present would still be
 * serialized into the DOM and could be interpreted as an inline event handler
 * by future refactors, lint rules, or CSP audits. This test pins the absence
 * of `onselect` on `stats-this-week-list` so any future change that
 * accidentally attaches an `onselect` handler to this weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onselect attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onselect attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onselect")).toBe(false);
    expect(ul.getAttribute("onselect")).toBeNull();
  });
});
