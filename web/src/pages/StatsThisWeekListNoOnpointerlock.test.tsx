import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpointerlock` identifier is not a defined HTML attribute or DOM event
 * handler — pointer lock state changes fire as `pointerlockchange` /
 * `pointerlockerror` events on `document`, not as inline element handlers.
 * Leaving an `onpointerlock` attribute on this presentational <ul> would
 * carry no behavior, would be serialized into the DOM, and could mislead
 * future refactors or static analyzers into believing pointer-lock handling
 * lives on this weekly summary list. Many other attribute absences are
 * already pinned on `stats-this-week-list` (id, role, style, tabindex,
 * cite, ARIA, etc.); pinning `onpointerlock` here ensures any future change
 * that accidentally attaches it to this list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerlock attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpointerlock attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerlock")).toBe(false);
    expect(ul.getAttribute("onpointerlock")).toBeNull();
  });
});
