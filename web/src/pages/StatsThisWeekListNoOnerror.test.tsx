import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3119: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onerror`
 * attribute is an inline event handler that, when present, executes its string
 * contents as JavaScript whenever the element raises an `error` event. On a
 * presentational <ul> it has no legitimate purpose: lists don't load external
 * resources, so they cannot fire `error` events under normal conditions, and
 * an inline `onerror` would primarily serve as an XSS injection sink or a
 * stray handler created by an unsafe refactor. Sibling tests already pin a
 * wide range of attribute absences on this ul (cite, id, role, style,
 * tabindex, ARIA, onchange, onfocus, etc.), but no test pins `onerror`
 * absence on `stats-this-week-list`. Pinning it here ensures any future
 * change that accidentally attaches an inline `onerror` handler to this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3119: stats-this-week-list ul has no onerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onerror")).toBe(false);
    expect(ul.getAttribute("onerror")).toBeNull();
  });
});
