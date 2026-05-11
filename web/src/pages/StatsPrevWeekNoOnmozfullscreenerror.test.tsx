import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onmozfullscreenerror` attribute is a
 * legacy Mozilla-prefixed inline event handler for the Fullscreen API's
 * error event. It has no defined semantics on a presentational <ul>, is
 * non-standard, and pinning its absence guards against any future change
 * that accidentally attaches such an inline handler to this element.
 */
describe("StatsPage stats-prev-week ul — onmozfullscreenerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmozfullscreenerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onmozfullscreenerror")).toBe(false);
    expect(ul.getAttribute("onmozfullscreenerror")).toBeNull();
  });
});
