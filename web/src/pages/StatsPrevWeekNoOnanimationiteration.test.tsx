import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3259: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onanimationiteration` content
 * attribute is an event handler attribute that fires every time a CSS
 * animation iteration completes on the element. This presentational summary
 * list has no animation behavior tied to iteration events, and attaching an
 * inline handler would both expand its API surface and risk executing
 * arbitrary script when re-rendered. Sibling tests pin the absence of many
 * other event handler and global attributes on this <ul>, but none pin the
 * absence of `onanimationiteration`. Pinning it here ensures any future
 * change that accidentally attaches an inline animation-iteration handler to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onanimationiteration attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3259: stats-prev-week ul has no onanimationiteration attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onanimationiteration")).toBe(false);
    expect(ul.getAttribute("onanimationiteration")).toBeNull();
  });
});
