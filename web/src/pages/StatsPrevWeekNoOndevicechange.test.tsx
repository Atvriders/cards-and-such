import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ondevicechange` attribute is
 * a global event handler attribute associated with the MediaDevices interface
 * on the Window object; it is not a meaningful inline content attribute for a
 * presentational <ul> summary list. Pinning its absence here ensures any
 * future change that accidentally attaches an `ondevicechange` handler (which
 * would attempt to bind an inline event handler on a list element) is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondevicechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ondevicechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondevicechange")).toBe(false);
    expect(ul.getAttribute("ondevicechange")).toBeNull();
  });
});
