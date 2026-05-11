import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3136: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onmousemove` HTML attribute
 * is an inline event handler whose value is parsed and executed as JavaScript
 * when the user moves the mouse over the element. Inline event-handler
 * attributes bypass the React synthetic-event system, are a known XSS sink
 * if any portion of their value is ever derived from user input, and would
 * defeat the project's strict Content Security Policy. This presentational
 * summary list never needs pointer-movement behavior, so any future change
 * that accidentally attaches an `onmousemove` attribute to it should be
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmousemove attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3136: stats-prev-week ul has no onmousemove attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmousemove")).toBe(false);
    expect(ul.getAttribute("onmousemove")).toBeNull();
  });
});
