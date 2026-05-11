import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onpointerlockchange` attribute on the
 * StatsPage current-week breakdown list (data-testid="stats-this-week-list").
 * The `onpointerlockchange` event handler is only meaningful on Document and
 * is fired when pointer lock state changes. On a presentational <ul> it has
 * no defined semantics. Pinning its absence ensures any future change that
 * accidentally attaches an inline onpointerlockchange handler to this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerlockchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpointerlockchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerlockchange")).toBe(false);
    expect(ul.getAttribute("onpointerlockchange")).toBeNull();
  });
});
