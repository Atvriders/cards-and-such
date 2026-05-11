import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3048: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `marquee` attribute has
 * no defined semantics on a <ul> — `<marquee>` is an obsolete element, and
 * the `marquee` name as an attribute is not part of any standard. Leaving
 * such a non-standard attribute present would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a presentational hint. Sibling tests
 * already pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`,
 * and a broad array of ARIA / global attributes on this <ul>, but none pin
 * the absence of `marquee`. Pinning it here ensures any future change that
 * accidentally attaches a `marquee` attribute to this presentational summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — marquee attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3048: stats-prev-week ul has no marquee attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("marquee")).toBe(false);
    expect(ul.getAttribute("marquee")).toBeNull();
  });
});
