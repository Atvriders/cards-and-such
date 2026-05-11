import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list stats-week-list--prev".
 * The `onstart` content attribute is only defined for the <marquee> element
 * (an obsolete element) and otherwise has no standardized meaning. On a <ul>
 * it carries no defined semantics, but leaving it present would still be
 * exposed via DOM serialization and could be misinterpreted by future
 * refactors, tooling, or any code path that scans for event-handler-like
 * attributes. Sibling tests pin the absence of many other attributes on this
 * <ul>, but none pin the absence of `onstart`. Pinning it here ensures any
 * future change that accidentally attaches an `onstart` value to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onstart")).toBe(false);
    expect(ul.getAttribute("onstart")).toBeNull();
  });
});
