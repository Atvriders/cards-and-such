import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `oncontextlost` attribute on StatsPage's current-week
 * breakdown list (data-testid="stats-this-week-list"). `oncontextlost` is an
 * event handler attribute associated with canvas/WebGL context-loss events and
 * has no defined behavior on a presentational <ul>. Pinning its absence ensures
 * any future change that accidentally attaches such a handler to this weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oncontextlost attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no oncontextlost attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncontextlost")).toBe(false);
    expect(ul.getAttribute("oncontextlost")).toBeNull();
  });
});
