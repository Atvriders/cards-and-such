import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onappinstalledchanged` attribute is not a defined HTML attribute or event
 * handler — the standard `appinstalled` event fires on `window` (via
 * `window.onappinstalled`), not on arbitrary list elements. Leaving such an
 * inline handler attribute on a presentational <ul> would have no effect at
 * runtime but would still be exposed via DOM serialization and could mislead
 * future refactors or static analysis. Pinning its absence here ensures any
 * future change that accidentally attaches an `onappinstalledchanged`
 * attribute to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onappinstalledchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onappinstalledchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onappinstalledchanged")).toBe(false);
    expect(ul.getAttribute("onappinstalledchanged")).toBeNull();
  });
});
