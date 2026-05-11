import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3319: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onselectionchange` event
 * handler attribute fires when the document's text selection changes; on the
 * spec it is defined on Document and on HTMLElement as part of the global
 * event handler IDL. On a presentational summary <ul> the attribute carries
 * no useful semantics, but leaving it present would attach a script handler
 * to every selection change in the document, hurting performance and
 * potentially leaking selection state. Sibling tests already pin the absence
 * of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of
 * ARIA / global attributes on this <ul>, but none pin the absence of
 * `onselectionchange`. Pinning it here ensures any future change that
 * accidentally attaches an `onselectionchange` handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onselectionchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3319: stats-prev-week ul has no onselectionchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onselectionchange")).toBe(false);
    expect(ul.getAttribute("onselectionchange")).toBeNull();
  });
});
