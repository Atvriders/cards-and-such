import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onplay` event handler
 * attribute is only meaningful on media elements (<audio>, <video>) where it
 * fires when playback begins after having been paused. On a <ul> it carries
 * no defined semantics, but if present it would still be registered by the
 * browser as an inline event handler and executed as JavaScript — making it
 * a potential XSS sink if its value were ever derived from untrusted input.
 * Sibling tests already pin the absence of many other attributes on this
 * presentational summary list; pinning the absence of `onplay` here ensures
 * any future change that accidentally attaches an inline media handler to
 * this <ul> is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onplay attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onplay attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onplay")).toBe(false);
    expect(ul.getAttribute("onplay")).toBeNull();
  });
});
