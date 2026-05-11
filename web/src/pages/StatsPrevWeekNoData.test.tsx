import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3044: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The bare HTML `data` attribute (not
 * `data-*`) is only defined on <object> elements, where it identifies the URL
 * of the resource to embed. On a <ul> the attribute carries no defined
 * semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as an object data source. Sibling tests
 * already pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`,
 * and a broad array of ARIA / global attributes on this <ul>, but none pin
 * the absence of the bare `data` attribute. Pinning it here ensures any
 * future change that accidentally attaches a `data` URL to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed. Note: this asserts the bare `data` attribute, not `data-*`
 * dataset attributes (which are expected — e.g. `data-testid`).
 */
describe("StatsPage stats-prev-week ul — data attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3044: stats-prev-week ul has no data attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("data")).toBe(false);
    expect(ul.getAttribute("data")).toBeNull();
  });
});
