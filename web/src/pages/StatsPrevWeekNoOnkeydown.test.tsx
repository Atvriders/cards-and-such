import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3126: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onkeydown` content
 * attribute, if present, would register an inline event handler that runs
 * arbitrary script when a key is pressed while the element has focus. On this
 * presentational summary list there is no keyboard interaction to handle:
 * the <ul> has no tabindex, no role, and no focusable children pinned by it.
 * Leaving `onkeydown` absent ensures no inline script is attached to this
 * element via the HTML attribute surface, keeping the list free of inline
 * event handlers that would bypass our CSP / event-delegation conventions.
 * Sibling tests pin the absence of other attributes (id, role, style,
 * tabindex, is, cite, and a broad array of ARIA / global attributes); this
 * test pins the absence of `onkeydown` specifically so that any future change
 * that accidentally attaches an inline keydown handler to this <ul> is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onkeydown attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3126: stats-prev-week ul has no onkeydown attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onkeydown")).toBe(false);
    expect(ul.getAttribute("onkeydown")).toBeNull();
  });
});
