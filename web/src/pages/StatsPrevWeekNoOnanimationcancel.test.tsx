import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onanimationcancel` attribute
 * is an inline event handler that fires when a CSS animation is cancelled.
 * On this presentational summary list there is no animation being tracked
 * and no script should be wired through an inline attribute. Leaving such
 * an attribute present would expose an inline-script execution surface,
 * conflict with CSP policies that forbid inline handlers, and mislead any
 * future refactor that tries to interpret it as a meaningful hook. Pinning
 * its absence here ensures any future change that accidentally attaches
 * `onanimationcancel` to this <ul> is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onanimationcancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onanimationcancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onanimationcancel")).toBe(false);
    expect(ul.getAttribute("onanimationcancel")).toBeNull();
  });
});
