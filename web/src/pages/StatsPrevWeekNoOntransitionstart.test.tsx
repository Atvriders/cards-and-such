import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3262: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ontransitionstart` attribute is
 * a global event-handler content attribute that, when present, would be parsed
 * by the HTML parser as a JavaScript event handler invoked when a CSS
 * transition begins on the element. Attaching inline event-handler attributes
 * to a presentational summary list provides no semantic value, bypasses the
 * React synthetic-event system, and represents an XSS-adjacent footgun if a
 * future refactor were to template user-controlled data into it. Sibling tests
 * already pin the absence of many other attributes on this <ul>, but none pin
 * the absence of `ontransitionstart`. Pinning it here ensures any future change
 * that accidentally attaches an `ontransitionstart` handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ontransitionstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3262: stats-prev-week ul has no ontransitionstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontransitionstart")).toBe(false);
    expect(ul.getAttribute("ontransitionstart")).toBeNull();
  });
});
