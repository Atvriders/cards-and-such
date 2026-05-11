import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3260: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onanimationiteration` IDL attribute is the inline event handler for the CSS
 * `animationiteration` event, fired each time a CSS animation completes one
 * iteration. The <ul> is presentational and has no CSS animations attached, so
 * any `onanimationiteration=""` content attribute would either be dead weight
 * or, worse, register an inline event handler that bypasses our React event
 * system and CSP posture. A wide array of inline animation/transition handler
 * absences (onanimationstart, onanimationend, ontransitionstart, etc.) are
 * already pinned on this ul, but no test pins `onanimationiteration`. Pinning
 * it here ensures any future change that accidentally attaches an inline
 * `onanimationiteration` handler to this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onanimationiteration attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3260: stats-this-week-list ul has no onanimationiteration attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onanimationiteration")).toBe(false);
    expect(ul.getAttribute("onanimationiteration")).toBeNull();
  });
});
