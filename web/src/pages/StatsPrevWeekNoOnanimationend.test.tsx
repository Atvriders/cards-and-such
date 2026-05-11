import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3256: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onanimationend` IDL/content
 * attribute, if present, registers a JavaScript event handler that fires when
 * a CSS animation on the element completes. This <ul> is a purely
 * presentational summary list with no animation-driven behavior, so attaching
 * an inline `onanimationend` handler would either be dead code or, worse, a
 * vector for unexpected script execution and XSS-style injection if the value
 * is ever derived from user-controllable data. Sibling tests already pin the
 * absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and many other
 * global / event-handler attributes on this <ul>, but none pin the absence of
 * `onanimationend`. Pinning it here ensures any future change that
 * accidentally wires an animation-end handler onto this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onanimationend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3256: stats-prev-week ul has no onanimationend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onanimationend")).toBe(false);
    expect(ul.getAttribute("onanimationend")).toBeNull();
  });
});
