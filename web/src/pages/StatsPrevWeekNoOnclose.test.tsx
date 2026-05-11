import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3241: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onclose` attribute is an
 * event-handler content attribute defined for <dialog> elements (fired when
 * the dialog is closed). On a <ul> it carries no defined semantics, but if it
 * were ever attached it would be parsed as an inline event handler, executed
 * by the browser, and would represent both an XSS hazard surface and a CSP
 * violation under any sane Content-Security-Policy. Sibling tests already pin
 * the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad
 * array of ARIA / global attributes on this <ul>, but none pin the absence of
 * `onclose`. Pinning it here ensures any future change that accidentally
 * attaches an `onclose` handler to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onclose attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3241: stats-prev-week ul has no onclose attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onclose")).toBe(false);
    expect(ul.getAttribute("onclose")).toBeNull();
  });
});
