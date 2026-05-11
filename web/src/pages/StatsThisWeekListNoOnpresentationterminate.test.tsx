import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpresentationterminate` attribute is a Presentation API event handler
 * defined on PresentationConnection objects, not on HTML elements. Attaching
 * it inline on a <ul> has no defined semantics and would either be ignored or
 * misinterpreted by future refactors, presentation/casting integrations, or
 * tooling that scrapes inline event handlers. Pinning its absence on this
 * presentational weekly summary list ensures any future change that
 * accidentally attaches an `onpresentationterminate` handler is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpresentationterminate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpresentationterminate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpresentationterminate")).toBe(false);
    expect(ul.getAttribute("onpresentationterminate")).toBeNull();
  });
});
