import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3220: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpointerenter` content
 * attribute, if present, would register an inline event handler that fires
 * when a pointer enters the element's bounding box — a behavior that is
 * inappropriate for a presentational summary list and that, like other inline
 * event-handler attributes, would also be a CSP violation vector if it ever
 * carried executable content. Sibling tests already pin the absence of `cite`,
 * `id`, `role`, `style`, `tabindex`, `is`, and a broad array of ARIA / global
 * / inline event-handler attributes on this <ul>, but none pin the absence of
 * `onpointerenter` specifically. Pinning it here ensures any future change
 * that accidentally attaches an `onpointerenter` handler attribute to this
 * presentational list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpointerenter attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3220: stats-prev-week ul has no onpointerenter attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerenter")).toBe(false);
    expect(ul.getAttribute("onpointerenter")).toBeNull();
  });
});
