import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3272: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy HTML
 * `onunload` event handler attribute is only meaningful on <body> and <frameset>
 * elements, where it registers a handler invoked when the document is being
 * unloaded. On a <ul> the attribute carries no defined semantics, but leaving
 * it present would still be exposed via DOM serialization and could be picked
 * up by browsers, audited as inline script (CSP), or accidentally evaluated
 * by tooling that scans for event-handler attributes. Many sibling attribute
 * absences on `stats-this-week-list` are already pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test currently pins `onunload` absence
 * on this ul. Pinning it here ensures any future change that accidentally
 * attaches an `onunload` handler to this presentational weekly summary list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onunload attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3272: stats-this-week-list ul has no onunload attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onunload")).toBe(false);
    expect(ul.getAttribute("onunload")).toBeNull();
  });
});
