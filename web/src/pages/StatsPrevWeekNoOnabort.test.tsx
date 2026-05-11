import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onabort` attribute is an
 * event-handler content attribute that, if present, would register an inline
 * JavaScript handler for the `abort` event. On a presentational <ul> there is
 * no reason for such a handler, and attaching one would both expand the
 * element's behavioral surface and constitute an inline-script vector that
 * undermines CSP hygiene. Sibling tests pin the absence of many other
 * attributes on this <ul>, but none pin `onabort`. Pinning it here ensures
 * any future change that accidentally attaches an inline `onabort` handler
 * to this summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onabort attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onabort attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onabort")).toBe(false);
    expect(ul.getAttribute("onabort")).toBeNull();
  });
});
