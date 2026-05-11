import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list
 * stats-week-list--prev". The HTML `onpause` content attribute is an event
 * handler that fires when media playback is paused; it is only meaningful on
 * media elements such as <audio> and <video>. On a presentational <ul> it has
 * no defined semantics, but if it were ever attached it would be parsed as
 * inline JavaScript and could become an XSS or CSP-violation vector. Sibling
 * tests already pin the absence of `id`, `role`, `style`, `tabindex`, `is`,
 * `cite`, and a broad array of ARIA / global attributes on this <ul>, but
 * none pin the absence of `onpause`. Pinning it here ensures any future
 * change that accidentally attaches an `onpause` handler to this summary list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpause attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpause attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpause")).toBe(false);
    expect(ul.getAttribute("onpause")).toBeNull();
  });
});
