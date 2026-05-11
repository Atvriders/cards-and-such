import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onpause` event handler attribute is only meaningful on media elements
 * (<audio>, <video>) where it fires when playback pauses. On a <ul> it carries
 * no defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could execute arbitrary script if it ever held a string
 * handler. A wide array of other this-week-list attribute absences are pinned
 * (id, role, style, tabindex, ARIA, cite, etc.), but no test pins `onpause`
 * absence on `stats-this-week-list`. Pinning it here ensures any future change
 * that accidentally attaches an `onpause` handler to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpause attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpause attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpause")).toBe(false);
    expect(ul.getAttribute("onpause")).toBeNull();
  });
});
