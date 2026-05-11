import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3313: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onbeforematch` event handler
 * attribute corresponds to the (now-deprecated and never standardized)
 * `beforematch` event that some browsers used to dispatch on elements inside
 * `hidden="until-found"` subtrees when the browser revealed them via
 * find-in-page or fragment navigation. On a presentational <ul> it has no
 * defined behavior, but leaving an `onbeforematch=""` style handler attribute
 * present in the DOM would expose a string-typed event handler to anything
 * walking the element's attributes and could be misinterpreted by future
 * refactors that introduce `hidden="until-found"` semantics. Sibling tests
 * already pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`,
 * and a broad array of ARIA / global / event-handler attributes on this <ul>,
 * but none pin the absence of `onbeforematch`. Pinning it here ensures any
 * future change that accidentally attaches an `onbeforematch` handler
 * attribute to this presentational summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforematch attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3313: stats-prev-week ul has no onbeforematch attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforematch")).toBe(false);
    expect(ul.getAttribute("onbeforematch")).toBeNull();
  });
});
