import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3235: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `ontoggle` event handler
 * attribute is only meaningful on <details> elements, where it fires when the
 * element's open state changes. On a <ul> the attribute carries no defined
 * semantics, but leaving it present would still be exposed via DOM
 * serialization and — because `on*` attributes register inline event handlers
 * — would represent a script-injection surface even on an element that cannot
 * fire the event. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `ontoggle`. Pinning it
 * here ensures any future change that accidentally attaches an `ontoggle`
 * handler to this presentational summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ontoggle attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3235: stats-prev-week ul has no ontoggle attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontoggle")).toBe(false);
    expect(ul.getAttribute("ontoggle")).toBeNull();
  });
});
