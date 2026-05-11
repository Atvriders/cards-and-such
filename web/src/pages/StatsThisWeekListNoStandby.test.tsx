import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3078: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `standby`
 * attribute is a legacy attribute defined only on <object>, where it provided a
 * message to display while the object loaded. It was never valid on <ul> and has
 * been removed from HTML5 entirely. Leaving it on this presentational weekly
 * summary list would still surface in DOM serialization and could mislead
 * assistive technology, crawlers, or future refactors that try to interpret it
 * as load-state text. A broad set of attribute absences on this ul are already
 * pinned (cite, id, role, style, tabindex, ARIA, etc.), but no test pins
 * `standby` absence. Pinning it here ensures any future change that accidentally
 * attaches a `standby` value to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — standby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3078: stats-this-week-list ul has no standby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("standby")).toBe(false);
    expect(ul.getAttribute("standby")).toBeNull();
  });
});
