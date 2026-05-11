import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `ondevicestart` attribute on StatsPage's prior-week
 * breakdown list (data-testid="stats-prev-week"). `ondevicestart` is a
 * Cordova/PhoneGap-era device-ready style inline event handler and has no
 * defined meaning on a presentational <ul>. Pinning its absence ensures any
 * future refactor that accidentally attaches such an inline handler to this
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondevicestart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ondevicestart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("ondevicestart")).toBe(false);
    expect(ul.getAttribute("ondevicestart")).toBeNull();
  });
});
