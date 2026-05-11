import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3130: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onmousedown` attribute is
 * an inline event handler attribute that, if present in the rendered markup,
 * would register a mousedown event listener parsed from a string of
 * JavaScript. Inline event handlers bypass React's synthetic event system,
 * defeat CSP `script-src` policies that disallow `unsafe-inline`, and are a
 * classic XSS sink when attribute values are derived from user-controlled
 * data. The prior-week summary list is a presentational <ul> with no
 * interactive behavior; it must never carry an `onmousedown` attribute.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>,
 * but none pin the absence of `onmousedown`. Pinning it here ensures any
 * future change that accidentally attaches an inline mousedown handler to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmousedown attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3130: stats-prev-week ul has no onmousedown attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmousedown")).toBe(false);
    expect(ul.getAttribute("onmousedown")).toBeNull();
  });
});
