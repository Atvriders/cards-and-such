import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2920: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `loading` attribute is only
 * meaningful on <img> and <iframe> elements, where it controls lazy-loading
 * behavior ("lazy" vs "eager"). On a <ul> the attribute carries no defined
 * semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead browsers, crawlers, or future refactors that
 * try to interpret it as a loading hint. Sibling tests already pin the absence
 * of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of
 * ARIA / global attributes on this <ul>, but none pin the absence of
 * `loading`. Pinning it here ensures any future change that accidentally
 * attaches a `loading` value to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — loading attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2920: stats-prev-week ul has no loading attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("loading")).toBe(false);
    expect(ul.getAttribute("loading")).toBeNull();
  });
});
