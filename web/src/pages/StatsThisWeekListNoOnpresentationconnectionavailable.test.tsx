import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins absence of the `onpresentationconnectionavailable` attribute on the
 * StatsPage current-week breakdown list (data-testid="stats-this-week-list").
 * The Presentation API's `connectionavailable` event fires on a
 * PresentationRequest, not on arbitrary HTML elements, so attaching an
 * `onpresentationconnectionavailable` content attribute to a plain <ul> is
 * meaningless and would only serve as dead surface area for future drift.
 * This test ensures any deliberate addition of such an attribute to this
 * presentational summary list is reviewed rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpresentationconnectionavailable attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpresentationconnectionavailable attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpresentationconnectionavailable")).toBe(false);
    expect(ul.getAttribute("onpresentationconnectionavailable")).toBeNull();
  });
});
