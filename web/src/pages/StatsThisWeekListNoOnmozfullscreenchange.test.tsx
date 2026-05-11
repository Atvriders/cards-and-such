import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul>. The `onmozfullscreenchange` attribute is a
 * legacy Mozilla-prefixed inline event handler for fullscreen change events
 * and has no business being attached to a presentational weekly summary list.
 * Pinning its absence ensures any future change that accidentally attaches
 * such a handler is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmozfullscreenchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmozfullscreenchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.hasAttribute("onmozfullscreenchange")).toBe(false);
    expect(ul.getAttribute("onmozfullscreenchange")).toBeNull();
  });
});
