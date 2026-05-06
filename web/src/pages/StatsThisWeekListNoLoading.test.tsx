import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2917: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `loading`
 * attribute is only defined on <img> and <iframe> elements, where it controls the
 * lazy/eager loading behavior of the embedded resource. On a <ul> the attribute
 * carries no defined semantics, but leaving it present would still be exposed via
 * DOM serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a loading hint. A wide array of other
 * this-week-list attribute absences are already pinned (id, role, style, tabindex,
 * cite, href, target, ARIA, etc.), but no test pins `loading` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `loading` value to this presentational weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — loading attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2917: stats-this-week-list ul has no loading attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("loading")).toBe(false);
    expect(ul.getAttribute("loading")).toBeNull();
  });
});
