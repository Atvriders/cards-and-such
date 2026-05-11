import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3253: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onanimationstart` content
 * attribute is an inline event handler for the CSS Animation Events
 * `animationstart` event. Inline event-handler attributes execute attribute
 * values as JavaScript when the corresponding event fires, which would be a
 * meaningful XSS / behavior-leak hazard if any user-derived data ever flowed
 * into this list's rendered attributes. Sibling tests already pin the absence
 * of many other attributes on this <ul>, but none pin the absence of
 * `onanimationstart` specifically. Pinning it here ensures any future change
 * that accidentally attaches an inline animation-start handler to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onanimationstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3253: stats-prev-week ul has no onanimationstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onanimationstart")).toBe(false);
    expect(ul.getAttribute("onanimationstart")).toBeNull();
  });
});
