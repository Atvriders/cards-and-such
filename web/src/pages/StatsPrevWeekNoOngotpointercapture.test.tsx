import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3226: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ongotpointercapture` attribute
 * is a global event handler content attribute that, when present in markup,
 * registers a handler for the `gotpointercapture` event fired after an element
 * captures a pointer via setPointerCapture(). This list is a static
 * presentational summary of last week's daily totals — it never participates in
 * pointer capture, has no drag/draw/gesture surface, and exposes no children
 * that need to observe capture transitions. Authoring an inline
 * `ongotpointercapture="..."` handler on it would attach a string-sourced
 * function to the element, executing arbitrary code on a pointer-capture event
 * that should never occur here, and would be flagged by any reasonable CSP
 * review. Sibling tests already pin the absence of `id`, `role`, `style`,
 * `tabindex`, `is`, `cite`, and many other global / ARIA / handler attributes
 * on this <ul>, but none pin the absence of `ongotpointercapture`. Pinning it
 * here ensures any future change that accidentally attaches a
 * `ongotpointercapture` handler to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ongotpointercapture attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3226: stats-prev-week ul has no ongotpointercapture attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ongotpointercapture")).toBe(false);
    expect(ul.getAttribute("ongotpointercapture")).toBeNull();
  });
});
