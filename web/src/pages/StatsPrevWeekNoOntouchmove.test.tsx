import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain presentational <ul>. The `ontouchmove` attribute is an
 * inline event handler that would execute arbitrary JavaScript whenever a
 * touch point moves across the element. Attaching it via a string attribute
 * would bypass React's synthetic event system, sidestep CSP `script-src`
 * protections (inline handlers are typically allowed by default), and could
 * introduce scroll-jank or unexpected gesture interception on touch devices.
 * Sibling tests pin the absence of many other inline handler and global
 * attributes on this <ul>; pinning `ontouchmove` here ensures any future
 * change that accidentally attaches an inline touch-move handler to this
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ontouchmove attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ontouchmove attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontouchmove")).toBe(false);
    expect(ul.getAttribute("ontouchmove")).toBeNull();
  });
});
