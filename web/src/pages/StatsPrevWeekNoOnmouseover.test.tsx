import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3144: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The legacy `onmouseover` inline
 * event handler attribute is a well-known XSS vector: any string assigned to
 * it is parsed and executed as JavaScript when the user hovers the element.
 * On a presentational summary list there is no legitimate reason to attach a
 * hover handler, and React applications should always wire interaction via
 * synthetic event props (onMouseOver) rather than emitting raw inline HTML
 * handlers. Sibling tests already pin the absence of `id`, `role`, `style`,
 * `tabindex`, `is`, `cite`, and a broad array of ARIA / global attributes on
 * this <ul>, but none pin the absence of `onmouseover`. Pinning it here
 * ensures any future change that accidentally serializes an inline
 * `onmouseover=` handler onto this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmouseover attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3144: stats-prev-week ul has no onmouseover attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseover")).toBe(false);
    expect(ul.getAttribute("onmouseover")).toBeNull();
  });
});
