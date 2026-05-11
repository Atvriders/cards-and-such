import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3056: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". HTML has no
 * standard `event` attribute on <ul>; historically a non-standard `event`
 * attribute existed only on the deprecated <script for=... event=...> pattern
 * and has no defined semantics on a list element. Leaving an `event` attribute
 * on this presentational weekly summary list would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as an event-handler binding. The sibling
 * `stats-prev-week` ul and a wide array of other this-week-list attribute
 * absences are already pinned (id, role, style, tabindex, ARIA, cite, etc.),
 * but no test pins `event` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an `event` attribute to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — event attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3056: stats-this-week-list ul has no event attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("event")).toBe(false);
    expect(ul.getAttribute("event")).toBeNull();
  });
});
