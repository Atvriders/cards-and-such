import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onthemechange` attribute is not a defined HTML event handler attribute — it
 * is neither a standard global event handler nor a recognized media/document
 * event hook. If it were ever attached to this presentational ul it would be
 * silently ignored by browsers, yet could still serialize into the DOM and
 * mislead future refactors, accessibility tooling, or theme-switching code
 * paths that scan for such hooks. Pinning its absence here ensures any future
 * change that accidentally attaches `onthemechange` to this weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onthemechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onthemechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onthemechange")).toBe(false);
    expect(ul.getAttribute("onthemechange")).toBeNull();
  });
});
