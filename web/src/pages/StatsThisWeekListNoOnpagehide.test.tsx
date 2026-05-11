import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3326: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onpagehide`
 * attribute is an inline event handler that fires when the page is hidden (e.g.,
 * navigating away or being placed in the bfcache). It is only meaningful on
 * <body> / <frameset> elements, where the global window pagehide event surfaces.
 * On a <ul> the attribute would either be silently ignored or, if mis-parsed by
 * future tooling, treated as inline JavaScript — a subtle XSS / CSP-bypass
 * surface. Sibling attribute-absence pins exist for this same ul (cite W2904,
 * id, role, style, tabindex, ARIA, plus a wide array of other inline event
 * handlers), but no test currently pins `onpagehide` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an inline `onpagehide` handler to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpagehide attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3326: stats-this-week-list ul has no onpagehide attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpagehide")).toBe(false);
    expect(ul.getAttribute("onpagehide")).toBeNull();
  });
});
