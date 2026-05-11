import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `ontouchstart` attribute on StatsPage's prior-week
 * breakdown list (data-testid="stats-prev-week"). The `ontouchstart` IDL
 * attribute is an inline event handler for the `touchstart` event. Inline
 * event handler attributes are a well-known XSS / behaviour-injection vector
 * and have no place on a presentational <ul>. Sibling tests already pin the
 * absence of many other attributes on this element; this test ensures any
 * future change that accidentally attaches an `ontouchstart` handler to this
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ontouchstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ontouchstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontouchstart")).toBe(false);
    expect(ul.getAttribute("ontouchstart")).toBeNull();
  });
});
