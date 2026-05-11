import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain presentational <ul>. The `onwebkitanimationstart`
 * content attribute is a legacy WebKit-prefixed inline event handler for the
 * `webkitAnimationStart` event, fired when a CSS animation using the
 * `-webkit-` prefixed properties begins. The unprefixed `animationstart`
 * event is the standardized replacement, and inline event-handler attributes
 * in general should not appear on presentational summary lists — they would
 * register handlers via DOM attribute reflection, bypass React's synthetic
 * event system, and could be a vector for stray script execution. Sibling
 * tests pin the absence of many other event-handler and global attributes on
 * this <ul>; this test pins the absence of `onwebkitanimationstart` so any
 * future change that accidentally attaches a legacy WebKit animation-start
 * handler to this element is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onwebkitanimationstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onwebkitanimationstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkitanimationstart")).toBe(false);
    expect(ul.getAttribute("onwebkitanimationstart")).toBeNull();
  });
});
