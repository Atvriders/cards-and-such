import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3200: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `ondragover` attribute is a legacy inline event handler that fires while a
 * dragged item is being moved over the element. On a presentational weekly
 * summary <ul> it carries no defined purpose, but if accidentally attached it
 * would silently install an inline drag handler — a subtle XSS / drag-and-drop
 * hijack surface and a behavioral footgun if a future refactor adds DnD to a
 * sibling element. A wide array of other this-week-list attribute absences are
 * pinned (id, role, style, tabindex, ARIA, cite, etc.), but no test pins
 * `ondragover` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an `ondragover` handler to this
 * presentational list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondragover attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3200: stats-this-week-list ul has no ondragover attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragover")).toBe(false);
    expect(ul.getAttribute("ondragover")).toBeNull();
  });
});
