import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onslotassign` event handler attribute is only meaningful on <slot> elements
 * within shadow DOM, where it fires when assigned nodes change. On a <ul> it
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could execute as an inline event handler if a
 * future refactor accidentally attached one. A wide array of other
 * this-week-list attribute absences are pinned (id, role, style, tabindex,
 * ARIA, cite, etc.), but no test pins `onslotassign` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onslotassign` handler to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onslotassign attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onslotassign attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onslotassign")).toBe(false);
    expect(ul.getAttribute("onslotassign")).toBeNull();
  });
});
