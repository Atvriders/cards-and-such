import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpresentationconnect` attribute is an inline event handler associated with
 * the Presentation API's `connect` event, which only fires on
 * PresentationRequest/PresentationConnection objects — never on a static <ul>.
 * Attaching it here would have no functional effect but would expose an
 * inline-handler attribute on a presentational element, undermining CSP
 * `script-src` guarantees, confusing static analyzers, and creating dead
 * surface area for accidental script injection. Pinning its absence ensures
 * any future change that wires presentation-connect handling into this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpresentationconnect attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpresentationconnect attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpresentationconnect")).toBe(false);
    expect(ul.getAttribute("onpresentationconnect")).toBeNull();
  });
});
