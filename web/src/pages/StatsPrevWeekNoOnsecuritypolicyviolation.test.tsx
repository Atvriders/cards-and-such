import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3316: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onsecuritypolicyviolation`
 * attribute is a global event-handler content attribute that fires when a CSP
 * directive is violated for the element. Attaching such a handler to a
 * presentational summary <ul> would have no defensible purpose: this list has
 * no inline resources, scripts, styles, or fetches that could trigger a CSP
 * violation, and any handler placed here would either be dead code or, worse,
 * silently swallow violations that ought to surface through the page-level
 * `Document` / `Window` `securitypolicyviolation` listener. Sibling tests pin
 * the absence of many other on* handlers on this <ul>, but none pin the
 * absence of `onsecuritypolicyviolation`. Pinning it here ensures any future
 * change that wires a CSP-violation handler to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onsecuritypolicyviolation attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3316: stats-prev-week ul has no onsecuritypolicyviolation attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsecuritypolicyviolation")).toBe(false);
    expect(ul.getAttribute("onsecuritypolicyviolation")).toBeNull();
  });
});
