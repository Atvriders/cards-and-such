import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3223: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpointerleave` content
 * attribute would register an inline DOM event handler that fires when a
 * pointer leaves the element's bounding box. This list is a purely
 * presentational summary and has no pointer-driven behaviour; attaching an
 * inline `onpointerleave` handler would either run arbitrary code on hover
 * exit or — more commonly — silently swallow the attribute as an unparsed
 * string while still exposing it via DOM serialization. Sibling tests already
 * pin the absence of `cite`, `id`, `role`, `style`, `tabindex`, `is`, and a
 * broad array of ARIA / global attributes on this <ul>, but none pin the
 * absence of `onpointerleave`. Pinning it here ensures any future change
 * that accidentally attaches an inline pointer-leave handler to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpointerleave attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3223: stats-prev-week ul has no onpointerleave attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerleave")).toBe(false);
    expect(ul.getAttribute("onpointerleave")).toBeNull();
  });
});
