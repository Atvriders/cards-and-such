import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpointerrawupdate` attribute, when set inline, would register a handler
 * for the high-frequency pointerrawupdate event — a coalesced-update pointer
 * stream typically used for drawing or gesture surfaces. A presentational
 * weekly summary list has no need to subscribe to raw pointer movement, and
 * an inline handler here would silently introduce a hot event listener,
 * potential performance regressions, and an inline-script CSP surface. This
 * test pins the absence of `onpointerrawupdate` on the this-week-list ul so
 * that any future change attaching such a handler is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerrawupdate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpointerrawupdate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerrawupdate")).toBe(false);
    expect(ul.getAttribute("onpointerrawupdate")).toBeNull();
  });
});
