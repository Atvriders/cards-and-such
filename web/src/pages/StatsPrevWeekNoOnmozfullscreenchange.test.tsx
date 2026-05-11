import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onmozfullscreenchange`
 * attribute is a legacy Mozilla-prefixed inline event handler that fires
 * when an element enters or leaves Mozilla's prefixed fullscreen mode.
 * It has no defined semantics on a presentational <ul> and, if present,
 * would attach an executable handler tied to a deprecated, browser-prefixed
 * API. Pinning its absence ensures any future change that accidentally
 * attaches a `onmozfullscreenchange` handler to this summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmozfullscreenchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmozfullscreenchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmozfullscreenchange")).toBe(false);
    expect(ul.getAttribute("onmozfullscreenchange")).toBeNull();
  });
});
