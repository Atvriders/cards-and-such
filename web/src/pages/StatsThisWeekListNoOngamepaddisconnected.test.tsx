import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ongamepaddisconnected` IDL attribute is a window-level GamepadEvent handler
 * (fired when a gamepad disconnects from the system) and has no defined
 * semantics as a content attribute on a presentational <ul>. Pinning its
 * absence ensures any future change that accidentally attaches a gamepad
 * disconnect handler to this weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ongamepaddisconnected attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ongamepaddisconnected attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ongamepaddisconnected")).toBe(false);
    expect(ul.getAttribute("ongamepaddisconnected")).toBeNull();
  });
});
