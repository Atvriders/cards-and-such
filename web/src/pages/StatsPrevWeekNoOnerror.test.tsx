import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3118: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onerror` attribute is an
 * event handler content attribute that wires inline JavaScript to error events
 * (e.g. on <img>, <script>, <body>, <link>). On a <ul> it has no meaningful
 * behavior, but leaving an inline `onerror` attribute present would expose an
 * XSS-shaped surface: any string written into that attribute is parsed and
 * executed as JavaScript by the browser, completely bypassing React's normal
 * synthetic event system and any CSP `unsafe-inline` protections that aren't
 * in place. Sibling tests already pin the absence of `id`, `role`, `style`,
 * `tabindex`, `is`, `cite`, and a broad array of ARIA / global attributes on
 * this <ul>, but none pin the absence of `onerror`. Pinning it here ensures
 * any future change that accidentally attaches an inline `onerror` handler to
 * this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3118: stats-prev-week ul has no onerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onerror")).toBe(false);
    expect(ul.getAttribute("onerror")).toBeNull();
  });
});
