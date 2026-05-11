import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ondevicemotion` attribute is a
 * global event handler that fires when the device's motion sensors report
 * acceleration data. It has no semantic meaning on a presentational summary
 * list and, if present, would silently install an inline event listener that
 * could leak sensor data, hold references that block GC, or violate strict
 * CSP policies that forbid inline handlers. Sibling tests already pin the
 * absence of `id`, `role`, `style`, `tabindex`, `cite`, and a broad array of
 * other attributes on this <ul>, but none pin the absence of
 * `ondevicemotion`. Pinning it here ensures any future change that
 * accidentally attaches an inline devicemotion handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondevicemotion attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ondevicemotion attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondevicemotion")).toBe(false);
    expect(ul.getAttribute("ondevicemotion")).toBeNull();
  });
});
