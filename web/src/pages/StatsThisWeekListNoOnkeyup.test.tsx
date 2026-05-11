import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onkeyup` attribute is an inline event handler that, if present, would
 * execute arbitrary JavaScript when a key is released while the element has
 * focus. Inline event-handler attributes are a known XSS vector and bypass
 * React's synthetic event system, so a presentational <ul> summarizing weekly
 * stats has no legitimate reason to carry one. A wide array of other
 * this-week-list attribute absences are already pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `onkeyup` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an inline `onkeyup` handler to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onkeyup attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onkeyup attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onkeyup")).toBe(false);
    expect(ul.getAttribute("onkeyup")).toBeNull();
  });
});
