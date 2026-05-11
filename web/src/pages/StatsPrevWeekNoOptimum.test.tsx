import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3108: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `optimum` attribute is only
 * meaningful on <meter> elements, where it indicates the optimum numeric value
 * within the gauge's range. On a <ul> the attribute carries no defined
 * semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a gauge target. Sibling tests already
 * pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a
 * broad array of ARIA / global attributes on this <ul>, but none pin the
 * absence of `optimum`. Pinning it here ensures any future change that
 * accidentally attaches an `optimum` value to this presentational summary list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — optimum attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3108: stats-prev-week ul has no optimum attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("optimum")).toBe(false);
    expect(ul.getAttribute("optimum")).toBeNull();
  });
});
