import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpaymentrequestchange` attribute is a legacy inline event handler tied to
 * the Payment Request API surface. It has no meaning on a presentational <ul>
 * summarizing weekly stats, and exposing it in serialized HTML could mislead
 * tooling, leak handler strings into the DOM, or be repurposed by a future
 * refactor in a way that introduces inline-script behavior. Pinning its
 * absence here ensures any change that accidentally attaches an
 * `onpaymentrequestchange` handler to this list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpaymentrequestchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpaymentrequestchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpaymentrequestchange")).toBe(false);
    expect(ul.getAttribute("onpaymentrequestchange")).toBeNull();
  });
});
