import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `ontimeupdate` event handler attribute is only meaningful on media elements
 * (<audio>, <video>) where it fires as playback position changes. On a <ul> it
 * carries no defined semantics, but leaving it present would attach an inline
 * event handler to a presentational list, conflict with our CSP/event-handler
 * policy, and could be silently invoked by future media-related refactors.
 * Pinning its absence here ensures any future change that accidentally attaches
 * an `ontimeupdate` handler to this weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontimeupdate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ontimeupdate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontimeupdate")).toBe(false);
    expect(ul.getAttribute("ontimeupdate")).toBeNull();
  });
});
