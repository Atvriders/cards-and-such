import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ondevicemotion` attribute is a Window-level event handler that fires when
 * the device's motion sensors report acceleration changes. It has no defined
 * semantics on a <ul> element and would never receive devicemotion events
 * from the browser, but its presence as an inline handler could still be
 * exposed via DOM serialization, potentially be picked up by static analysis
 * tools as a sensor-access surface, or mislead future refactors into wiring
 * motion-sensor logic onto a presentational summary list. Pinning its
 * absence ensures any future change that accidentally attaches an
 * ondevicemotion handler to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondevicemotion attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ondevicemotion attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondevicemotion")).toBe(false);
    expect(ul.getAttribute("ondevicemotion")).toBeNull();
  });
});
