import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". `onbeforefocus`
 * is not a standardized HTML event attribute — it is not part of the HTML
 * living standard, has no defined semantics in modern browsers, and would not
 * wire up a real focus-related handler. If it were to appear on this element,
 * it would either be silently ignored or, in IE-derived legacy environments,
 * attempt to invoke an inline handler string against the element. Either way,
 * its presence on a presentational weekly summary list would be misleading
 * noise that future readers, refactors, or assistive tech tooling might try to
 * interpret. Pinning its absence here ensures any future change that
 * accidentally attaches an `onbeforefocus` attribute to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforefocus attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforefocus attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforefocus")).toBe(false);
    expect(ul.getAttribute("onbeforefocus")).toBeNull();
  });
});
