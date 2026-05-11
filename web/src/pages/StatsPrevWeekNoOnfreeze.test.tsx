import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3331: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onfreeze` attribute is not a
 * standard HTML event handler attribute — it does not correspond to any
 * defined DOM event in the HTML Living Standard. If present, it would be
 * exposed via DOM serialization but would not wire up any handler, leaving
 * dead surface area that could confuse linters, accessibility tooling, or
 * future refactors that try to interpret it as a lifecycle hook. Sibling
 * tests already pin the absence of `cite`, `id`, `role`, `style`, `tabindex`,
 * `is`, and a broad array of ARIA / global attributes on this <ul>, but none
 * pin the absence of `onfreeze`. Pinning it here ensures any future change
 * that accidentally attaches an `onfreeze` attribute to this presentational
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onfreeze attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3331: stats-prev-week ul has no onfreeze attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfreeze")).toBe(false);
    expect(ul.getAttribute("onfreeze")).toBeNull();
  });
});
