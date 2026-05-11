import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3250: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onfullscreenerror` IDL
 * attribute is an event-handler content attribute that fires when an element
 * fails to transition into fullscreen mode. It is only meaningful on elements
 * that are themselves candidates for the Fullscreen API and, even then, is
 * almost always wired via JavaScript rather than serialized into HTML. On a
 * presentational summary <ul> it has no business being present: leaving it
 * attached would (a) advertise a fullscreen surface that does not exist,
 * (b) execute arbitrary inline JavaScript on a fullscreen failure, and
 * (c) bypass our normal React event-handler conventions. Sibling tests
 * already pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`,
 * and a broad array of ARIA / global / event-handler attributes on this <ul>,
 * but none pin the absence of `onfullscreenerror`. Pinning it here ensures any
 * future change that accidentally attaches an `onfullscreenerror` handler to
 * this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onfullscreenerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3250: stats-prev-week ul has no onfullscreenerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfullscreenerror")).toBe(false);
    expect(ul.getAttribute("onfullscreenerror")).toBeNull();
  });
});
