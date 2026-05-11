import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3046: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `declare`
 * attribute is a legacy boolean attribute that was only ever defined on the
 * obsolete <object> element (HTML 4) to mark it as a declaration rather than
 * an instantiation; it has no defined semantics on a <ul> and is removed from
 * modern HTML. Leaving it present on this presentational weekly summary list
 * would still be exposed via DOM serialization and could confuse legacy parsers,
 * assistive technology, or future refactors. A wide array of other
 * this-week-list attribute absences are already pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `declare` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `declare` attribute to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — declare attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3046: stats-this-week-list ul has no declare attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("declare")).toBe(false);
    expect(ul.getAttribute("declare")).toBeNull();
  });
});
