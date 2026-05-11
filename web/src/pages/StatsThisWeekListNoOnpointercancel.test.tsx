import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3218: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpointercancel` attribute is an inline pointer-event handler that fires
 * when a pointer interaction is canceled (for example by the OS taking over a
 * touch gesture or by the pointer leaving the document). The presentational
 * weekly summary ul has no need to intercept pointer cancellation events —
 * doing so via an inline HTML attribute would attach untrusted-string-evaluated
 * JavaScript to a presentational list and broaden its event surface. A wide
 * array of other this-week-list attribute absences are pinned (id, role,
 * style, tabindex, ARIA, cite, on* handlers, etc.), but no test pins
 * `onpointercancel` absence on `stats-this-week-list`. Pinning it here ensures
 * any future change that accidentally attaches an `onpointercancel` handler
 * to this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointercancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3218: stats-this-week-list ul has no onpointercancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointercancel")).toBe(false);
    expect(ul.getAttribute("onpointercancel")).toBeNull();
  });
});
