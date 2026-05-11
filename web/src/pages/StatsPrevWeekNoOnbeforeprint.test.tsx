import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3304: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onbeforeprint` content attribute
 * is an event-handler attribute that, when present, would register an inline
 * JavaScript handler for the global `beforeprint` event. Inline event-handler
 * attributes on presentational list elements are both semantically meaningless
 * and a known XSS / CSP smell, since they execute arbitrary JS scraped from
 * markup. The `beforeprint` event also fires on `window`, not on a <ul>, so
 * attaching it here would silently never run while still polluting the DOM.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global / event-handler attributes
 * on this <ul>, but none pin the absence of `onbeforeprint`. Pinning it here
 * ensures any future change that accidentally attaches an inline
 * `onbeforeprint` handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforeprint attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3304: stats-prev-week ul has no onbeforeprint attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeprint")).toBe(false);
    expect(ul.getAttribute("onbeforeprint")).toBeNull();
  });
});
