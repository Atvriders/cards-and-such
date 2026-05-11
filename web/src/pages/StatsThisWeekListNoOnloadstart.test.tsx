import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onloadstart` attribute on the StatsPage current-week
 * breakdown list (data-testid="stats-this-week-list"). `onloadstart` is a media
 * event handler attribute that fires when a resource begins loading; it has no
 * defined behavior on a plain <ul> presentational list, but if it ever slipped
 * in as an inline handler string it would be parsed and executed by the
 * browser, opening an XSS-style execution surface. This test pins its absence
 * alongside the other inline event-handler absence tests for this element.
 */
describe("StatsPage stats-this-week-list ul — onloadstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onloadstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onloadstart")).toBe(false);
    expect(ul.getAttribute("onloadstart")).toBeNull();
  });
});
