import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onpaymentrequestchange` attribute on the
 * StatsPage prior-week breakdown list (data-testid="stats-prev-week").
 * `onpaymentrequestchange` is a legacy Payment Request API event handler
 * content attribute that has no place on a presentational <ul>. Pinning
 * its absence ensures that any future change which accidentally attaches
 * such a handler attribute to this list is caught in review rather than
 * silently shipping unexpected payment-related event wiring.
 */
describe("StatsPage stats-prev-week ul — onpaymentrequestchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpaymentrequestchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpaymentrequestchange")).toBe(false);
    expect(ul.getAttribute("onpaymentrequestchange")).toBeNull();
  });
});
