import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3325: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpagehide` content attribute
 * is an HTML event handler attribute that, on a <body>/<frameset> element,
 * registers a handler invoked when the page is being hidden (e.g. bfcache
 * eviction or navigation away). On a plain <ul> it has no defined behavior,
 * but if it were present and contained executable string content the browser
 * could still surface it via DOM serialization and a future refactor that
 * promoted the element or wired up matching JS could accidentally activate
 * lifecycle code on this presentational summary list. Sibling tests already
 * pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a
 * broad array of ARIA / global attributes on this <ul>, but none pin the
 * absence of `onpagehide`. Pinning it here ensures any future change that
 * accidentally attaches an `onpagehide` handler to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpagehide attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3325: stats-prev-week ul has no onpagehide attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpagehide")).toBe(false);
    expect(ul.getAttribute("onpagehide")).toBeNull();
  });
});
