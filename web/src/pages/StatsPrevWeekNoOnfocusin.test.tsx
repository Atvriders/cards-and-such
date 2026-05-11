import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3149: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onfocusin` content attribute,
 * if present, would register an inline event handler that fires when focus
 * enters the element or any descendant, executing arbitrary script directly
 * from the HTML. A presentational summary <ul> should never carry inline
 * event handler attributes — they bypass the React synthetic event system,
 * complicate CSP enforcement, and risk subtle focus-management bugs.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>,
 * but none pin the absence of `onfocusin`. Pinning it here ensures any
 * future change that accidentally attaches an inline focus handler to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onfocusin attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3149: stats-prev-week ul has no onfocusin attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfocusin")).toBe(false);
    expect(ul.getAttribute("onfocusin")).toBeNull();
  });
});
