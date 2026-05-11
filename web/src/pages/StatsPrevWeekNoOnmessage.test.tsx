import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3283: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onmessage` attribute is a
 * window-level event handler in HTML's event handler content attribute list
 * and is not a defined attribute for <ul> elements. If it were ever attached
 * inline, browsers would attempt to compile its value as JavaScript on the
 * element, which is both a footgun and a potential XSS vector if any future
 * change ever interpolated unsanitized data into this attribute. Sibling
 * tests already pin the absence of `id`, `role`, `style`, `tabindex`, `is`,
 * `cite`, and a broad array of ARIA / global attributes on this <ul>, but
 * none pin the absence of `onmessage`. Pinning it here ensures any future
 * change that accidentally attaches an `onmessage` handler to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmessage attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3283: stats-prev-week ul has no onmessage attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmessage")).toBe(false);
    expect(ul.getAttribute("onmessage")).toBeNull();
  });
});
