import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3229: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onlostpointercapture` content
 * attribute is an event-handler attribute associated with Pointer Events:
 * it fires when an element loses pointer capture previously set via
 * setPointerCapture(). This presentational summary list never captures
 * pointers — it has no pointerdown/setPointerCapture wiring — so wiring an
 * `onlostpointercapture` handler on it would be dead code at best and a
 * source of confusing, silently-failing pointer logic at worst. Sibling
 * tests already pin the absence of many other event-handler and global
 * attributes on this <ul>, but none pin `onlostpointercapture`. Pinning it
 * here ensures any future change that accidentally attaches an
 * `onlostpointercapture` handler to this list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onlostpointercapture attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3229: stats-prev-week ul has no onlostpointercapture attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onlostpointercapture")).toBe(false);
    expect(ul.getAttribute("onlostpointercapture")).toBeNull();
  });
});
