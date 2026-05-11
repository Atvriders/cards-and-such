import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onmozfullscreenerror` event handler attribute is a legacy Mozilla-prefixed
 * fullscreen API hook that has no place on a presentational weekly summary
 * list. While modern browsers have largely retired the moz-prefixed
 * fullscreen API in favour of the unprefixed Fullscreen API, an inline
 * `onmozfullscreenerror` handler would still be parsed and registered by
 * Gecko-derived engines, creating a surprise side channel for script
 * execution on a list that should be inert. This test pins its absence so
 * any future change that attaches such a handler is reviewed deliberately.
 */
describe("StatsPage stats-this-week-list ul — onmozfullscreenerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmozfullscreenerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmozfullscreenerror")).toBe(false);
    expect(ul.getAttribute("onmozfullscreenerror")).toBeNull();
  });
});
