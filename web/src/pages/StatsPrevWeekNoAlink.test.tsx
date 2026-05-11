import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3068: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `alink` attribute is a
 * legacy, deprecated presentational attribute that historically applied to
 * <body> to color "active" links during a click; it has no defined semantics
 * on a <ul> and was removed from HTML in modern specs. Leaving it present
 * would still be exposed via DOM serialization and could mislead assistive
 * technology, crawlers, legacy browsers, or future refactors that try to
 * interpret it as a link-color directive. Sibling tests already pin the
 * absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad
 * array of ARIA / global attributes on this <ul>, but none pin the absence
 * of `alink`. Pinning it here ensures any future change that accidentally
 * attaches an `alink` value to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — alink attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3068: stats-prev-week ul has no alink attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("alink")).toBe(false);
    expect(ul.getAttribute("alink")).toBeNull();
  });
});
