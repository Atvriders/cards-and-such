import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2969: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `srcdoc` attribute is only
 * meaningful on <iframe> elements, where it provides the inline HTML document
 * to embed in place of fetching from `src`. On a <ul> the attribute carries no
 * defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead crawlers, sanitizers, or future refactors
 * that try to interpret it as embeddable HTML content. Sibling tests already
 * pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a
 * broad array of ARIA / global attributes on this <ul>, but none pin the
 * absence of `srcdoc`. Pinning it here ensures any future change that
 * accidentally attaches a `srcdoc` payload to this presentational summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — srcdoc attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2969: stats-prev-week ul has no srcdoc attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("srcdoc")).toBe(false);
    expect(ul.getAttribute("srcdoc")).toBeNull();
  });
});
