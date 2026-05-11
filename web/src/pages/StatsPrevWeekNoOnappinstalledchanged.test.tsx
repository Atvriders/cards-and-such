import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onappinstalledchanged`
 * attribute is a non-standard inline event-handler attribute that has no
 * defined behavior on a <ul>; it is not part of any HTML specification for
 * list elements. Leaving such a handler attribute present would still be
 * exposed via DOM serialization and could mislead assistive technology,
 * crawlers, or future refactors that try to interpret it as a live event
 * binding. Sibling tests already pin the absence of many other attributes
 * on this <ul>, but none pin the absence of `onappinstalledchanged`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onappinstalledchanged` handler to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onappinstalledchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onappinstalledchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onappinstalledchanged")).toBe(false);
    expect(ul.getAttribute("onappinstalledchanged")).toBeNull();
  });
});
