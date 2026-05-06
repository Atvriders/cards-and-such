import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2925: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `decoding` attribute is
 * only meaningful on <img> elements, where it provides a hint to the browser
 * about how to decode the image (sync, async, auto). On a <ul> the attribute
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could mislead assistive technology, crawlers, or
 * future refactors that try to interpret it as an image-decoding hint. Sibling
 * tests already pin the absence of `id`, `role`, `style`, `tabindex`, `is`,
 * `cite`, `crossorigin`, `loading`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `decoding`. Pinning it
 * here ensures any future change that accidentally attaches a `decoding` hint
 * to this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — decoding attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2925: stats-prev-week ul has no decoding attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("decoding")).toBe(false);
    expect(ul.getAttribute("decoding")).toBeNull();
  });
});
