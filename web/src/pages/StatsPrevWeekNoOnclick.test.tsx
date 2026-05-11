import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3152: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onclick` attribute is a
 * legacy inline event handler that, when present in markup, registers a click
 * listener parsed from a string of JavaScript source. Inline handlers bypass
 * React's synthetic event system, defeat Content Security Policy
 * `script-src 'self'` style protections, are difficult to test, and represent
 * an XSS sink if any portion of the attribute value is derived from
 * user-controlled data. This presentational summary list has no interactive
 * semantics and must never carry an inline `onclick`. Sibling tests already
 * pin the absence of many other inline event handlers (onerror, onload,
 * onmousedown, etc.) on this <ul>, but none pin the absence of `onclick`.
 * Pinning it here ensures any future change that accidentally attaches an
 * inline click handler to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onclick attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3152: stats-prev-week ul has no onclick attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onclick")).toBe(false);
    expect(ul.getAttribute("onclick")).toBeNull();
  });
});
