import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onblur` content attribute is a
 * global event handler that fires when an element loses focus. This <ul> is a
 * presentational summary list that is never focused, so attaching an `onblur`
 * handler via a content attribute would be dead code that needlessly inlines
 * script into the DOM, bypassing React's synthetic event system and any
 * Content-Security-Policy that forbids inline event handlers. Sibling tests
 * pin the absence of many other unwanted attributes on this <ul>; this test
 * pins the absence of `onblur` so that any future change which accidentally
 * attaches an inline blur handler to this presentational list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onblur attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onblur attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onblur")).toBe(false);
    expect(ul.getAttribute("onblur")).toBeNull();
  });
});
