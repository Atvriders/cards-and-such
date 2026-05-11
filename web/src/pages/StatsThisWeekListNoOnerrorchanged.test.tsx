import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onerrorchanged` attribute has no defined semantics on any HTML element —
 * it is not a standard event handler (the standard handler is `onerror`),
 * not part of any ARIA spec, and not a known DOM property. Leaving such an
 * attribute on a presentational <ul> would still be serialized into the DOM
 * and could confuse assistive technology, crawlers, linters, or future
 * refactors that attempt to interpret it as an event handler. Pinning its
 * absence here ensures any future change that accidentally attaches an
 * `onerrorchanged` attribute to this weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onerrorchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onerrorchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onerrorchanged")).toBe(false);
    expect(ul.getAttribute("onerrorchanged")).toBeNull();
  });
});
