import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". `onmotion` is
 * not a defined HTML/DOM event attribute — there is no MotionEvent fired on
 * arbitrary list elements, and React does not synthesize an `onMotion` handler.
 * Any `onmotion` attribute on this presentational <ul> would therefore be
 * meaningless dead markup at best, and at worst a confusing inline-handler-like
 * string that future tooling, linters, or assistive technology could
 * misinterpret. Other behavioral/event attribute absences (onclick, onload,
 * etc.) are pinned across the stats-this-week-list surface; pinning `onmotion`
 * absence here ensures any future change that attaches such an attribute to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmotion attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmotion attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmotion")).toBe(false);
    expect(ul.getAttribute("onmotion")).toBeNull();
  });
});
