import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3265: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `ontransitionend` attribute
 * is an inline event handler for the CSS `transitionend` event. On this
 * presentational summary <ul> there are no CSS transitions to react to, and
 * attaching inline event handler attributes is both a security/CSP concern
 * (inline-script style handlers) and a maintenance hazard (silent string-to-
 * function coercion). Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global /
 * event-handler attributes on this <ul>, but none pin the absence of
 * `ontransitionend`. Pinning it here ensures any future change that
 * accidentally attaches a transition-end handler attribute to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ontransitionend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3265: stats-prev-week ul has no ontransitionend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontransitionend")).toBe(false);
    expect(ul.getAttribute("ontransitionend")).toBeNull();
  });
});
