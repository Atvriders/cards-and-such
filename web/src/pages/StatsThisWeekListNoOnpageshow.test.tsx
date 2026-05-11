import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3329: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onpageshow` attribute is an event handler content attribute defined on
 * <body> elements (and, by spec, exposed on all HTMLElements via the
 * GlobalEventHandlers mixin reflection rules) that fires when a page is
 * shown — including bfcache restores. Setting `onpageshow` as an HTML
 * attribute on a non-body <ul> has no meaningful effect, but the attribute
 * would still be present in DOM serialization and would execute its string
 * value as JavaScript if a browser ever decided to invoke it. That makes
 * it an inline-script-injection vector that would also bypass strict CSP
 * `script-src` directives that disallow inline scripts (event handler
 * content attributes are themselves inline scripts). The sibling
 * `stats-prev-week` ul and a wide array of other event-handler and ARIA
 * attributes are already pinned absent on `stats-this-week-list`, but no
 * test currently pins `onpageshow` absence. Pinning it here ensures any
 * future change that accidentally attaches an `onpageshow` handler string
 * to this presentational weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpageshow attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3329: stats-this-week-list ul has no onpageshow attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpageshow")).toBe(false);
    expect(ul.getAttribute("onpageshow")).toBeNull();
  });
});
