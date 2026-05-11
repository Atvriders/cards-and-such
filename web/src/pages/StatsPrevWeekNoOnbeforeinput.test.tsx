import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3205: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onbeforeinput` content
 * attribute is an inline event handler that fires before an editing host
 * receives input. It is only meaningful on editable elements (form controls,
 * contenteditable hosts). On a presentational <ul> it carries no defined
 * behavior, but leaving it present would attach a JS handler via DOM
 * serialization and could fire unexpectedly if the list (or a descendant)
 * ever became editable, plus it would surface as an inline-handler CSP
 * violation. Sibling tests already pin the absence of `id`, `role`, `style`,
 * `tabindex`, `is`, `cite`, and many other global / ARIA / event-handler
 * attributes on this <ul>, but none pin the absence of `onbeforeinput`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onbeforeinput` handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforeinput attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3205: stats-prev-week ul has no onbeforeinput attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeinput")).toBe(false);
    expect(ul.getAttribute("onbeforeinput")).toBeNull();
  });
});
