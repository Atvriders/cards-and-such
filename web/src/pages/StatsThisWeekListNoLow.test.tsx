import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3104: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `low`
 * attribute is only meaningful on the <meter> element, where it specifies the
 * upper bound of the low range for the gauge. On a <ul> the attribute has no
 * defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a meter threshold. A wide array of
 * other this-week-list attribute absences are pinned (id, role, style,
 * tabindex, ARIA, cite, high, etc.), but no test pins `low` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `low` value to this presentational weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — low attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3104: stats-this-week-list ul has no low attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("low")).toBe(false);
    expect(ul.getAttribute("low")).toBeNull();
  });
});
