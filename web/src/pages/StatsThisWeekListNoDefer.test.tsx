import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2967: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `defer`
 * attribute is only meaningful on <script> elements, where it instructs the
 * browser to defer execution until after the document has been parsed. On a
 * <ul> the attribute carries no defined semantics, but leaving it present would
 * still be exposed via DOM serialization and could mislead assistive technology,
 * crawlers, or future refactors that try to interpret it as a script-loading
 * hint. A wide array of other this-week-list attribute absences are pinned
 * (id, role, style, tabindex, cite, ARIA, etc.), but no test pins `defer`
 * absence on `stats-this-week-list`. Pinning it here ensures any future change
 * that accidentally attaches a `defer` attribute to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — defer attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2967: stats-this-week-list ul has no defer attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("defer")).toBe(false);
    expect(ul.getAttribute("defer")).toBeNull();
  });
});
