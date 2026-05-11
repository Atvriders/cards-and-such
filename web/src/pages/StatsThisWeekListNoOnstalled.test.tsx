import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onstalled` attribute is an inline event handler defined only on media
 * elements (<audio>, <video>); on a presentational <ul> it has no defined
 * semantics. If it were ever set as an attribute, the browser would still
 * compile its string value as a JavaScript function and expose it on the
 * element, making it both a noise source for assistive technology and a
 * potential injection vector. Pinning its absence here ensures any future
 * change that accidentally attaches an `onstalled` handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onstalled attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onstalled attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onstalled")).toBe(false);
    expect(ul.getAttribute("onstalled")).toBeNull();
  });
});
