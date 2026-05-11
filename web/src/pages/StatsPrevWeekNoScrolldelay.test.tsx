import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3060: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `scrolldelay` attribute is a
 * legacy, non-standard attribute originally defined on the obsolete <marquee>
 * element to control the millisecond delay between scroll steps. It has no
 * defined semantics on a <ul> and is not part of any current HTML
 * specification, but if left present it would still be serialized into the
 * DOM and could mislead assistive technology, crawlers, or future refactors
 * that try to interpret it as an animation hint. Sibling tests already pin
 * the absence of `cite`, `id`, `role`, `style`, `tabindex`, `is`, and a
 * broad array of ARIA / global attributes on this <ul>, but none pin the
 * absence of `scrolldelay`. Pinning it here ensures any future change that
 * accidentally attaches a `scrolldelay` value to this presentational summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — scrolldelay attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3060: stats-prev-week ul has no scrolldelay attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("scrolldelay")).toBe(false);
    expect(ul.getAttribute("scrolldelay")).toBeNull();
  });
});
