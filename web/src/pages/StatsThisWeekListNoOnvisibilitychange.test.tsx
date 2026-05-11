import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3323: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onvisibilitychange` attribute is an inline event handler corresponding to
 * the `visibilitychange` event, which only fires on `document` (and Workers).
 * It has no defined behavior on a <ul> element and would be a meaningless,
 * non-functional inline handler if ever attached. Beyond being inert, an
 * inline `onvisibilitychange=` attribute on a presentational list would
 * expose a string of JavaScript via DOM serialization and could trip CSP,
 * security scanners, or future refactors that try to interpret it. The
 * sibling `stats-prev-week` ul has many event-handler absences pinned, and a
 * wide array of other this-week-list attribute absences are pinned (id, role,
 * style, tabindex, ARIA, cite, etc.), but no test pins `onvisibilitychange`
 * absence on `stats-this-week-list`. Pinning it here ensures any future
 * change that accidentally attaches an inline `onvisibilitychange` handler to
 * this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onvisibilitychange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3323: stats-this-week-list ul has no onvisibilitychange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onvisibilitychange")).toBe(false);
    expect(ul.getAttribute("onvisibilitychange")).toBeNull();
  });
});
