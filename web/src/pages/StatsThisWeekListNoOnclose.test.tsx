import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3242: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onclose`
 * attribute is only meaningful on <dialog> elements, where it registers an
 * event handler for the `close` event. On a <ul> the attribute has no defined
 * semantics, but if it were present as a content attribute it could be parsed
 * and executed by the browser as inline event-handler script, creating an
 * unexpected XSS surface and bypassing CSP for inline handlers. The sibling
 * `stats-prev-week` ul already has many of its inline event-handler attribute
 * absences pinned, and `stats-this-week-list` has numerous other attribute
 * absences pinned (id, role, style, cite, ARIA, etc.), but no test pins
 * `onclose` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an `onclose` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onclose attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3242: stats-this-week-list ul has no onclose attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onclose")).toBe(false);
    expect(ul.getAttribute("onclose")).toBeNull();
  });
});
