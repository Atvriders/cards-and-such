import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onseeked` attribute is an event handler that fires when a media element
 * (<audio>/<video>) finishes seeking. On a <ul> the attribute carries no
 * meaningful behavior, but if present it would still be registered as an
 * inline event handler via DOM serialization, creating a needless script
 * surface and potentially confusing assistive technology, crawlers, or
 * future refactors. Pinning its absence here ensures any future change
 * that accidentally attaches an `onseeked` handler to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onseeked attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onseeked attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onseeked")).toBe(false);
    expect(ul.getAttribute("onseeked")).toBeNull();
  });
});
