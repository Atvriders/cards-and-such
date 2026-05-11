import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onpresentationdisconnect` attribute on the
 * StatsPage current-week breakdown list (data-testid="stats-this-week-list").
 * The Presentation API's `onpresentationdisconnect` handler is only meaningful
 * on `PresentationConnection`/related objects, never on a plain <ul>. Leaving
 * such an inline event-handler attribute on the markup would attach a global
 * event sink, risk silent script execution from string-valued handlers, and
 * obscure the list's purely presentational role. This test pins its absence
 * so any future change that accidentally wires presentation-connection
 * lifecycle handlers onto this weekly summary list is reviewed deliberately.
 */
describe("StatsPage stats-this-week-list ul — onpresentationdisconnect attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpresentationdisconnect attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpresentationdisconnect")).toBe(false);
    expect(ul.getAttribute("onpresentationdisconnect")).toBeNull();
  });
});
