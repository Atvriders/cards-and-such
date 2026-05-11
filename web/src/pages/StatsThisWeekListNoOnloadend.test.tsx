import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onloadend` attribute on the StatsPage current-week
 * breakdown list (data-testid="stats-this-week-list"). The `onloadend` event
 * handler attribute is defined for elements that perform resource loading
 * (e.g. <img>, <script>, XHR/FileReader targets) and has no defined semantics
 * on a presentational <ul>. Leaving an inline `onloadend=...` handler on this
 * list would either be a dead attribute or, worse, an inline script injection
 * vector if a future refactor templated user-controlled data into it. Pinning
 * its absence ensures any future change that attaches an `onloadend` handler
 * to this weekly summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onloadend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onloadend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onloadend")).toBe(false);
    expect(ul.getAttribute("onloadend")).toBeNull();
  });
});
