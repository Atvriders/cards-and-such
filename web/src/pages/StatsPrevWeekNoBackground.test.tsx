import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3026: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `background` attribute is
 * a deprecated, presentational attribute defined only on <body> in legacy HTML,
 * where it pointed at a background image URL. On a <ul> it has no defined
 * semantics, is not honored by modern browsers, and would only serve to bloat
 * DOM output, confuse assistive technology, or mislead future refactors that
 * try to interpret it as styling metadata. Sibling tests already pin the
 * absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array
 * of ARIA / global attributes on this <ul>, but none pin the absence of
 * `background`. Pinning it here ensures any future change that accidentally
 * attaches a `background` URL to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — background attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3026: stats-prev-week ul has no background attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("background")).toBe(false);
    expect(ul.getAttribute("background")).toBeNull();
  });
});
