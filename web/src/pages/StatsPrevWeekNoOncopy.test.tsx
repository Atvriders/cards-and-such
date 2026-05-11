import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3160: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The legacy `oncopy` content
 * attribute is an inline event handler hook that, when present, registers a
 * JavaScript expression to run whenever the user copies a selection within
 * the element. Inline event handlers like `oncopy` violate strict CSP
 * policies, sidestep React's synthetic event system, and create a
 * potential XSS sink if their value is ever derived from untrusted input.
 * On a presentational summary <ul> there is no legitimate reason for an
 * `oncopy` attribute to appear in the rendered DOM. Sibling tests already
 * pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and
 * a broad array of ARIA / global attributes on this <ul>, but none pin the
 * absence of `oncopy`. Pinning it here ensures any future change that
 * accidentally attaches an `oncopy` inline handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — oncopy attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3160: stats-prev-week ul has no oncopy attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncopy")).toBe(false);
    expect(ul.getAttribute("oncopy")).toBeNull();
  });
});
