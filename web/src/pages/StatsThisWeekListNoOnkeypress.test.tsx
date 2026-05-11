import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy
 * `onkeypress` inline event handler attribute has no business being attached
 * to this presentational summary list — the element is not interactive, does
 * not receive keyboard focus, and any future keyboard handling should be
 * wired through React's synthetic event system (onKeyDown / onKeyUp) on a
 * focusable child rather than via an HTML-level `onkeypress` string. Inline
 * `onkeypress` is also deprecated in modern HTML in favor of `keydown`/`keyup`.
 * A wide array of other this-week-list attribute absences are pinned (id,
 * role, style, tabindex, ARIA, cite, etc.), but no test pins `onkeypress`
 * absence on `stats-this-week-list`. Pinning it here ensures any future
 * change that accidentally attaches an `onkeypress` handler attribute to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onkeypress attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onkeypress attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onkeypress")).toBe(false);
    expect(ul.getAttribute("onkeypress")).toBeNull();
  });
});
