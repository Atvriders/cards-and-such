import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3289: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onoffline` attribute is a
 * window-level event handler attribute (it fires on the global window object
 * when the browser loses network connectivity) and is only meaningful when
 * applied to <body> or <frameset>. On a <ul> the attribute carries no defined
 * semantics, but leaving it present would still be serialized into the DOM
 * and could be picked up as an inline event handler string in some parser
 * paths, or mislead future refactors that try to attach offline behavior to
 * this presentational summary list. Sibling tests already pin the absence of
 * many global, ARIA, and event handler attributes on this <ul>, but none pin
 * the absence of `onoffline`. Pinning it here ensures any future change that
 * accidentally attaches an offline handler to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onoffline attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3289: stats-prev-week ul has no onoffline attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onoffline")).toBe(false);
    expect(ul.getAttribute("onoffline")).toBeNull();
  });
});
