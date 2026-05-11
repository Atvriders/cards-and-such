import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3073: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `hspace` attribute is an
 * obsolete presentational attribute that was historically used on <img>,
 * <object>, and <applet> elements to specify horizontal whitespace around
 * the element in pixels. It has no defined semantics on a <ul> and is
 * deprecated in HTML5 in favor of CSS margin. Leaving it present would still
 * be exposed via DOM serialization and could mislead assistive technology,
 * crawlers, or future refactors that try to interpret it as layout intent.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>,
 * but none pin the absence of `hspace`. Pinning it here ensures any future
 * change that accidentally attaches an `hspace` value to this presentational
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — hspace attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3073: stats-prev-week ul has no hspace attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("hspace")).toBe(false);
    expect(ul.getAttribute("hspace")).toBeNull();
  });
});
