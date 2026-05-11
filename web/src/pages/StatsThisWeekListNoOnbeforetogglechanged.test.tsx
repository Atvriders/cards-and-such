import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onbeforetogglechanged` attribute is not a defined HTML event handler
 * attribute and carries no standardized semantics on a <ul>. Leaving such an
 * attribute present would still be exposed via DOM serialization and could
 * mislead future refactors or tooling that scan for event handlers. Pinning
 * its absence ensures any future change that accidentally attaches an
 * `onbeforetogglechanged` value to this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforetogglechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforetogglechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforetogglechanged")).toBe(false);
    expect(ul.getAttribute("onbeforetogglechanged")).toBeNull();
  });
});
