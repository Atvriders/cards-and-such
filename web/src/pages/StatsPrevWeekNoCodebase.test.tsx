import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3040: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `codebase` attribute is a
 * legacy HTML attribute historically associated with <applet> and <object>
 * elements where it pointed at the base URL used to resolve relative URLs
 * for the applet/object. On a <ul> the attribute has no defined semantics
 * and any value would simply be serialized into the DOM, potentially
 * confusing assistive technology, crawlers, or future refactors that try
 * to interpret it as a base URL hint. Sibling tests already pin the absence
 * of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of
 * ARIA / global attributes on this <ul>, but none pin the absence of
 * `codebase`. Pinning it here ensures any future change that accidentally
 * attaches a `codebase` value to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — codebase attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3040: stats-prev-week ul has no codebase attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("codebase")).toBe(false);
    expect(ul.getAttribute("codebase")).toBeNull();
  });
});
