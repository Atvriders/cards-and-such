import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3014: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `frame`
 * attribute is a legacy presentational attribute valid only on <table> elements
 * (and even there obsolete in HTML5), where it specified which sides of the
 * outer table border should be visible. On a <ul> the attribute carries no
 * defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as table chrome. A wide array of other
 * this-week-list attribute absences are already pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `frame` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `frame` attribute to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — frame attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3014: stats-this-week-list ul has no frame attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("frame")).toBe(false);
    expect(ul.getAttribute("frame")).toBeNull();
  });
});
