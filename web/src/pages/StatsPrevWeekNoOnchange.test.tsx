import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onchange` attribute is an
 * inline event handler that only carries meaning on form-associated elements
 * (<input>, <select>, <textarea>) where it fires when the user commits a value
 * change. On a presentational <ul> the attribute has no defined behavior, but
 * leaving it present would still execute as inline script if some refactor
 * surfaced a value change, and it would bypass the React event system that the
 * rest of the page relies on. Sibling tests already pin the absence of `id`,
 * `role`, `style`, `tabindex`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `onchange`. Pinning it
 * here ensures any future change that accidentally attaches an inline change
 * handler to this presentational summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onchange")).toBe(false);
    expect(ul.getAttribute("onchange")).toBeNull();
  });
});
