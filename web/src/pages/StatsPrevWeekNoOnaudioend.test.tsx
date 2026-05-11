import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onaudioend` attribute is an
 * event handler content attribute defined for media elements (<audio>,
 * <video>) and fires when playback reaches the end of the media. On a <ul>
 * it has no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could be misinterpreted by tooling, accidentally
 * register a global handler, or otherwise create surprising side effects.
 * Sibling tests already pin the absence of many other inline event-handler
 * and global attributes on this <ul>, but none pin the absence of
 * `onaudioend`. Pinning it here ensures any future change that accidentally
 * attaches an `onaudioend` handler to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onaudioend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onaudioend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onaudioend")).toBe(false);
    expect(ul.getAttribute("onaudioend")).toBeNull();
  });
});
