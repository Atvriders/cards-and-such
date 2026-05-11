import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy
 * `onactivate` attribute is an SVG/XML inline event handler with no defined
 * meaning on HTML <ul> elements. If a stray `onactivate` attribute were ever
 * attached, it would either be silently ignored by HTML parsers or, worse,
 * provide a foothold for legacy XSS vectors in mixed XML/HTML contexts.
 * Pinning its absence ensures any future change that accidentally introduces
 * an `onactivate` handler on this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onactivate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onactivate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onactivate")).toBe(false);
    expect(ul.getAttribute("onactivate")).toBeNull();
  });
});
