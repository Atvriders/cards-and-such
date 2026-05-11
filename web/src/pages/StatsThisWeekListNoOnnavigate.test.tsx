import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins absence of the `onnavigate` attribute on StatsPage's current-week
 * breakdown list (data-testid="stats-this-week-list"). The `onnavigate`
 * event handler is defined on the Navigation API's `window.navigation`
 * object, not on arbitrary DOM elements — placing it as an HTML attribute
 * on a presentational <ul> has no defined semantics and would not wire up
 * any navigation listener. Serializing such an attribute could still
 * mislead future refactors or tooling that scrape DOM attributes. This
 * test ensures any future change that accidentally attaches an
 * `onnavigate` attribute to this weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onnavigate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onnavigate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onnavigate")).toBe(false);
    expect(ul.getAttribute("onnavigate")).toBeNull();
  });
});
