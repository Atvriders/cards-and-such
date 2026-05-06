import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2937: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `step`
 * attribute is only defined on <input> elements (with type number, range, date,
 * datetime-local, month, time, or week), where it constrains the granularity of
 * accepted values. On a <ul> the attribute carries no defined semantics, but
 * leaving it present would still be exposed via DOM serialization and could
 * mislead assistive technology, crawlers, or future refactors that try to
 * interpret it as a numeric step constraint. A wide array of other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex, cite, href,
 * target, loading, min, ARIA, etc.), but no test pins `step` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `step` value to this presentational weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — step attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2937: stats-this-week-list ul has no step attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("step")).toBe(false);
    expect(ul.getAttribute("step")).toBeNull();
  });
});
