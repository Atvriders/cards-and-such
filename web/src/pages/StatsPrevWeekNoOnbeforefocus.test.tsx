import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". `onbeforefocus` is not a defined
 * HTML or DOM event-handler attribute — the standard pre-focus lifecycle is
 * exposed via `focusin`/`onfocusin` (and `focus`/`onfocus`). Leaving an
 * `onbeforefocus` attribute on the element would either be silently ignored
 * by browsers or, worse, picked up by some legacy/vendor tooling as an
 * inline handler hook, both of which would be surprising on a purely
 * presentational summary list. Sibling tests already pin the absence of a
 * broad array of attributes on this <ul>; pinning `onbeforefocus` here
 * ensures any future change that accidentally attaches such a handler to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforefocus attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbeforefocus attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforefocus")).toBe(false);
    expect(ul.getAttribute("onbeforefocus")).toBeNull();
  });
});
