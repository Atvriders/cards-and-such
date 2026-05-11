import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `oncuechange` event-handler content attribute is only meaningful on media
 * text-track elements (HTMLTrackElement / TextTrack); on a <ul> it would be
 * treated as an inline JavaScript event handler and represent a serious XSS
 * and CSP surface if ever attached. Pinning its absence on the
 * stats-this-week-list ensures any future change that accidentally attaches
 * an `oncuechange` handler to this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oncuechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no oncuechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncuechange")).toBe(false);
    expect(ul.getAttribute("oncuechange")).toBeNull();
  });
});
