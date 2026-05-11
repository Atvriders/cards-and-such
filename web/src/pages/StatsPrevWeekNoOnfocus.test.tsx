import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3111: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onfocus` content attribute is
 * an inline event handler that, if present, would execute arbitrary JavaScript
 * when the element receives focus. On a presentational summary <ul> there is
 * no reason to attach a focus handler, and inline event-handler attributes are
 * a well-known XSS vector and a CSP-violation risk. Sibling tests already pin
 * the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad
 * array of ARIA / global attributes on this <ul>, but none pin the absence of
 * `onfocus`. Pinning it here ensures any future change that accidentally
 * attaches an `onfocus` handler attribute to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onfocus attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3111: stats-prev-week ul has no onfocus attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfocus")).toBe(false);
    expect(ul.getAttribute("onfocus")).toBeNull();
  });
});
