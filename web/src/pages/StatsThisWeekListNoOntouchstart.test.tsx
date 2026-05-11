import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ontouchstart` attribute is an inline event handler that would, if present,
 * register a JavaScript callback for the touchstart event directly on the
 * element. This presentational weekly summary list has no need for any inline
 * event handlers, and attaching one would both violate the project's
 * separation-of-concerns conventions (handlers belong in React's synthetic
 * event system, not inline HTML attributes) and create a potential XSS sink
 * if user-controlled data ever flowed into it. Pinning the absence of
 * `ontouchstart` here ensures any future change that accidentally attaches an
 * inline touch handler to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontouchstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ontouchstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontouchstart")).toBe(false);
    expect(ul.getAttribute("ontouchstart")).toBeNull();
  });
});
