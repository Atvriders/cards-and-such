import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3082: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `archive` attribute is a
 * legacy/obsolete attribute that was historically defined on <applet> and
 * <object> elements as a space-separated list of archive URIs. It has no
 * defined semantics on a <ul> element, and modern HTML treats it as a
 * non-standard custom attribute there. Leaving an `archive` attribute on this
 * presentational summary list would still be exposed via DOM serialization and
 * could mislead assistive technology, crawlers, or future refactors that try
 * to interpret it as an archival reference. Sibling tests already pin the
 * absence of `cite`, `id`, `role`, `style`, `tabindex`, `is`, and a broad
 * array of ARIA / global attributes on this <ul>, but none pin the absence of
 * `archive`. Pinning it here ensures any future change that accidentally
 * attaches an `archive` value to this list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — archive attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3082: stats-prev-week ul has no archive attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("archive")).toBe(false);
    expect(ul.getAttribute("archive")).toBeNull();
  });
});
